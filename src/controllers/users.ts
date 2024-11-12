import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Category from "../models/Category";
import Transaction from "../models/Transaction";

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).populate("categories");
    //.populate("transactions");

    console.log(user);

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

const createCategory = async (categoryData: any) => {
  const category = new Category({
    name: categoryData.name,
    color: categoryData.color,
    type: categoryData.type,
  });

  return await category.save();
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId, password, categories, transactions } = req.body;

    if (password) {
      req.body.password = bcrypt.hashSync(password, 10);
    }

    if (categories) {
      const newCategory = await createCategory(
        categories[categories.length - 1]
      );

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: { categories: newCategory._id },
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
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        ...req.body,
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
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findOneAndDelete({ _id: userId });

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

export { getUser, updateUser, deleteUser };
