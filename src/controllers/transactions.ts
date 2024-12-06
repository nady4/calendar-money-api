import { Request, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";
import { v4 as uuidv4 } from "uuid";

const createTransaction = async (req: Request, res: Response) => {
  try {
    const { date, amount, description, category, repeats } = req.body;
    const userId = req.params.userId;
    const group = uuidv4();

    const transaction = new Transaction({
      date,
      amount,
      description,
      category,
      group: repeats ? group : null,
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

    if (repeats) {
      const repeatedTransactions = [];

      for (let i = 1; i <= 12; i++) {
        const newTransaction = new Transaction({
          date: new Date(
            new Date(date).getFullYear(),
            new Date(date).getMonth() + i,
            new Date(date).getDate()
          ),
          amount,
          description,
          category,
          group,
        });

        const savedTransaction = await newTransaction.save();
        repeatedTransactions.push(savedTransaction._id);

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

export { createTransaction, updateTransaction, deleteTransaction };
