import { Request, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";

const createTransaction = async (req: Request, res: Response) => {
  try {
    const { date, amount, description, category } = req.body;
    const userId = req.params.userId;

    const transaction = new Transaction({
      date,
      amount,
      description,
      category,
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
    ).populate([
      {
        path: "categories",
        model: "Category",
        select: "name color type",
      },
      {
        path: "transactions",
        model: "Transaction",
        select: "date amount description category",
      },
    ]);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
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
    const { id, date, amount, description, category } = req.body;

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

    return res.status(200).json({
      success: true,
      user: updatedTransaction,
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
    const userId = req.params.userId;
    const transactionId = req.params.transactionId;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { transactions: transactionId },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      {
        path: "categories",
        model: "Category",
        select: "name color type",
      },
      {
        path: "transactions",
        model: "Transaction",
        select: "date amount description category",
      },
    ]);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await Transaction.findOneAndDelete({ _id: transactionId });

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
