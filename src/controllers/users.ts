import User from "../models/User";
import { Request, Response } from "express";

const getUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await User.find({ username: username });

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

const addUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

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
  const { username, email, password } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { email, password },
      { new: true }
    );

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

const deleteUser = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
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

export { getUser, addUser, updateUser, deleteUser };
