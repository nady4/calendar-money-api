import { Request, Response } from "express";

interface AuthRequest extends Request {
  token?: string;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: Function
) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = verifyToken;
