"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}
const verifyToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const userId = req.params.userId;
        if (userId && userId !== decoded.id) {
            throw new AuthError("User ID mismatch");
        }
        req.user = { _id: decoded.id };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
exports.verifyToken = verifyToken;
