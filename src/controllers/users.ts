import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.find({ username: req.params.username });

    if (!user.length) {
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
    const { username, email } = req.body;
    const newPassword = bcrypt.hashSync(req.body.password, 10);

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { email: email, password: newPassword },
      { new: true }
    );

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

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const user = await User.findOneAndDelete({ username: username });

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
