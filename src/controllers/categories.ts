import { Request, Response } from "express";
import User from "../models/User";
import Category from "../models/Category";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color, type } = req.body;
    const userId = req.params.userId;

    const category = new Category({
      name,
      color,
      type,
    });

    await category.save();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { categories: category._id },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "categories",
      model: "Category",
      select: "name color type",
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
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id, name, color, type } = req.body;

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      {
        name,
        color,
        type,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: updatedCategory,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const userId = req.params.userId;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { categories: id },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "categories",
      model: "Category",
      select: "name color type",
    });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await Category.findOneAndDelete({ _id: id });

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

export { createCategory, updateCategory, deleteCategory };
