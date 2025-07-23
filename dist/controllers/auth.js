"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const defaultCategories_1 = require("../util/defaultCategories");
const registrationSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" }),
    email: zod_1.z.string().email({ message: "Invalid email format" }),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
        message: "Password must contain at least one letter and one number",
    }),
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = registrationSchema.parse(req.body);
        const isEmailAvailable = !(yield User_1.default.findOne({ email }));
        const isUsernameAvailable = !(yield User_1.default.findOne({ username }));
        if (!isUsernameAvailable) {
            console.log("\nUsername not available on registration 🚫");
            return res.status(402).json("Username not available on registration 🚫");
        }
        if (!isEmailAvailable) {
            console.log("\nEmail not available on registration 🚫");
            return res.status(403).json("Email not available on registration 🚫");
        }
        const hash = bcrypt_1.default.hashSync(password, 10);
        const defaultCategoryIds = yield (0, defaultCategories_1.insertDefaultCategories)();
        const user = new User_1.default({
            username,
            email,
            password: hash,
            categories: defaultCategoryIds,
        });
        yield user.save();
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map((e) => e.message).join(", ");
            console.log("\nValidation error on registration 🚫:", errors);
            return res.status(400).json(errors);
        }
        console.error("\nUnexpected error on registration:", error);
        return res.status(500).json("An unexpected error occurred 🚫");
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield User_1.default.findOne({ username: username })
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
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        console.log("\nPassword incorrect 🚫");
        return res.status(401).json("\nPassword incorrect 🚫");
    }
    jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
        return res.status(200).json({
            success: true,
            token,
            user,
        });
    });
    console.log("\nUser logged in successfully ✅");
});
exports.login = login;
const logout = (req, res) => {
    try {
        res.clearCookie("user");
        res.clearCookie("token");
        return res.status(200).json("User logged out successfully ✅");
    }
    catch (error) {
        console.error("Error logging out: ", error);
        return res.status(500).json("An error occurred during logout 🚫");
    }
};
exports.logout = logout;
