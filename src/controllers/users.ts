import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import Category from "../models/Category";
import Transaction from "../models/Transaction";

const getUser = async (req: Request, res: Response) => {
  try {
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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, email, username } = req.body;
    const userId = req.params.userId;

    if (password) {
      req.body.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        email: email,
        username: username,
        password: req.body.password,
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

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId }).select(
      "categories transactions"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Category.deleteMany({ _id: { $in: user.categories } });
    await Transaction.deleteMany({ _id: { $in: user.transactions } });
    await User.findOneAndDelete({ _id: userId });

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export { getUser, updateUser, deleteUser };
