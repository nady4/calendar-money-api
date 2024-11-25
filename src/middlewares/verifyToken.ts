import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

interface JWTPayload {
  user: {
    _id: string;
  };
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthError("No authorization header");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AuthError("Invalid authorization header format");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AuthError("No token provided");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    const userId = req.params.userId;
    if (userId && userId !== decoded.user._id) {
      throw new AuthError("User ID mismatch");
    }

    req.user = decoded.user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
        message: error.message,
      });
    }

    if (error instanceof AuthError) {
      return res.status(403).json({
        error: "Authentication failed",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred during authentication",
    });
  }
};
