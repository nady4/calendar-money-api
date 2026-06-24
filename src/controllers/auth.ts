// src/controllers/authController.ts
import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import {
  insertDefaultCategories,
  insertDefaultTransactions,
} from "../util/defaultData";

const registrationSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
      message: "Password must contain at least one letter and one number",
    }),
});

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = registrationSchema.parse(req.body);

    const isEmailAvailable = !(await User.findOne({ email }));
    const isUsernameAvailable = !(await User.findOne({ username }));

    if (!isUsernameAvailable) {
      console.log("\nUsername not available on registration 🚫");
      return res.status(402).json("Username not available on registration 🚫");
    }
    if (!isEmailAvailable) {
      console.log("\nEmail not available on registration 🚫");
      return res.status(403).json("Email not available on registration 🚫");
    }

    const hash = bcrypt.hashSync(password, 10);
    const defaultCategoryIds = await insertDefaultCategories();

    const user = new User({
      username,
      email,
      password: hash,
      categories: defaultCategoryIds,
    });

    await user.save();

    await insertDefaultTransactions(user._id.toString());

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => e.message).join(", ");
      console.log("\nValidation error on registration 🚫:", errors);
      return res.status(400).json(errors);
    }

    console.error("\nUnexpected error on registration:", error);
    return res.status(500).json("An unexpected error occurred 🚫");
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username })
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
    console.log("Username not found on login 🚫");
    return res.status(400).json("\nUser not found on login 🚫");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    console.log("\nPassword incorrect 🚫");
    return res.status(401).json("\nPassword incorrect 🚫");
  }

  jwt.sign(
    { id: user._id, username: user.username },
    (process.env.JWT_SECRET ?? process.env.JWT_KEY) as string,
    { expiresIn: "7d" },
    (err, token) => {
      return res.status(200).json({
        success: true,
        token,
        user,
      });
    }
  );

  console.log("\nUser logged in successfully ✅");
};

const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("user");
    res.clearCookie("token");
    return res.status(200).json("User logged out successfully ✅");
  } catch (error) {
    console.error("Error logging out: ", error);
    return res.status(500).json("An error occurred during logout 🚫");
  }
};

export { register, login, logout };
