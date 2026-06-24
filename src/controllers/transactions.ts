import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Transaction from "../models/Transaction";
import Category from "../models/Category";
import { v4 as uuidv4 } from "uuid";

const REPEAT_LIMIT = 12;

const getRepeatStep = (repeats: unknown): "weekly" | "monthly" | null => {
  if (repeats === "weekly" || repeats === "monthly") return repeats;
  return null;
};

const createTransaction = async (req: Request, res: Response) => {
  try {
    const { date, amount, description, category, repeats } = req.body;
    const userId = req.params.userId;
    const repeatMode = getRepeatStep(repeats);
    const group = repeatMode ? uuidv4() : null;

    const transaction = new Transaction({
      date,
      amount,
      description,
      category,
      group,
    });

    await transaction.save();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { transactions: transaction._id },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("categories")
      .populate({
        path: "transactions",
        model: "Transaction",
        populate: {
          path: "category",
          model: "Category",
        },
      });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (repeatMode && group) {
      const base = new Date(date);
      for (let i = 1; i <= REPEAT_LIMIT; i++) {
        const next = new Date(base);
        if (repeatMode === "weekly") {
          next.setDate(base.getDate() + i * 7);
        } else {
          next.setMonth(base.getMonth() + i);
        }
        const newTransaction = new Transaction({
          date: next,
          amount,
          description,
          category,
          group,
        });
        const savedTransaction = await newTransaction.save();
        updatedUser.transactions.push(savedTransaction._id);
      }
      await updatedUser.save();
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id, date, amount, description, category, group } = req.body;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id },
      {
        date,
        amount,
        description,
        category,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    if (group) {
      await Transaction.updateMany(
        { group: group },
        {
          date,
          amount,
          description,
          category,
        }
      );
    }

    const user = await User.findById(req.params.userId)
      .populate("categories")
      .populate({
        path: "transactions",
        model: "Transaction",
        populate: {
          path: "category",
          model: "Category",
        },
      });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const userId = req.params.userId;

    const transactionToDelete = await Transaction.findById(id);

    if (!transactionToDelete) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    const group = transactionToDelete.group;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          transactions: {
            $in: group
              ? await Transaction.find({ group }).distinct("_id")
              : [id],
          },
        },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("categories")
      .populate({
        path: "transactions",
        model: "Transaction",
        populate: {
          path: "category",
          model: "Category",
        },
      });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (group) {
      await Transaction.deleteMany({ group });
    } else {
      await Transaction.findOneAndDelete({ _id: id });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

interface BulkCategory {
  _id?: string;
  name: string;
  color: string;
  type: string;
}

interface BulkTransaction {
  _id?: string;
  date: Date | string;
  amount: number;
  description: string;
  category: string;
  group?: string;
}

const BULK_LIMIT = 5000;

const bulkImport = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const {
      categories = [],
      transactions = [],
    } = req.body as {
      categories?: BulkCategory[];
      transactions?: BulkTransaction[];
    };

    if (
      !Array.isArray(categories) ||
      !Array.isArray(transactions) ||
      categories.length + transactions.length > BULK_LIMIT
    ) {
      return res.status(400).json({
        success: false,
        error: `Invalid payload. Total items must be under ${BULK_LIMIT}.`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const userObjectId = user._id as mongoose.Types.ObjectId;

    const incomingCategoryIds = new Set<string>();
    const categoryDocs: Array<{ _id: string; data: BulkCategory }> = [];

    for (const c of categories) {
      if (!c?.name || !c?.type || !c?.color) continue;
      const key = c._id || `name:${c.name}`;
      if (incomingCategoryIds.has(key)) continue;
      incomingCategoryIds.add(key);
      categoryDocs.push({ _id: key, data: c });
    }

    const existingByName = await Category.find({
      name: { $in: categoryDocs.map((c) => c.data.name) },
    });
    const existingByNameMap = new Map(
      existingByName.map((c) => [c.name, c])
    );

    const categoryIdMap = new Map<string, string>();
    for (const entry of categoryDocs) {
      const existing = existingByNameMap.get(entry.data.name);
      if (existing) {
        categoryIdMap.set(entry._id, existing._id.toString());
      }
    }

    for (const entry of categoryDocs) {
      if (categoryIdMap.has(entry._id)) continue;
      const newCat = await Category.create({
        name: entry.data.name,
        color: entry.data.color,
        type: entry.data.type,
      });
      categoryIdMap.set(entry._id, newCat._id.toString());
    }

    const transactionIds: string[] = [];
    let skipped = 0;

    for (const t of transactions) {
      if (
        !t?.date ||
        typeof t?.amount !== "number" ||
        !t?.description ||
        !t?.category
      ) {
        skipped += 1;
        continue;
      }

      const categoryKey = t.category;
      const finalCategoryId =
        categoryIdMap.get(categoryKey) || categoryKey;

      const tx = new Transaction({
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: finalCategoryId,
        group: t.group || null,
      });
      const saved = await tx.save();
      transactionIds.push(saved._id.toString());
    }

    const allCategoryIds = Array.from(
      new Set([
        ...user.categories.map((id: mongoose.Types.ObjectId) => id.toString()),
        ...Array.from(categoryIdMap.values()),
      ])
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          categories: allCategoryIds,
          transactions: [
            ...user.transactions.map(
              (id: mongoose.Types.ObjectId) => id
            ),
            ...transactionIds,
          ],
        },
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("categories")
      .populate({
        path: "transactions",
        model: "Transaction",
        populate: { path: "category", model: "Category" },
      });

    return res.status(200).json({
      success: true,
      imported: {
        categories: categoryIdMap.size,
        transactions: transactionIds.length,
        skipped,
      },
      user: updatedUser,
    });
  } catch (err) {
    console.error("Bulk import error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
};
