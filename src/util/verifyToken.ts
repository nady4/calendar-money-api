import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response) => {
  const { userId } = req.body;
  const authorization = req.get("authorization");

  if (typeof authorization !== "undefined") {
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );

    if (userId !== (decoded as any).user._id) {
      return res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
};
