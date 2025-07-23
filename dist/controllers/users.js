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
exports.deleteUser = exports.updateUser = exports.getUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const Category_1 = __importDefault(require("../models/Category"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const mongoose_1 = __importDefault(require("mongoose"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.userId)
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
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid user ID",
            });
        }
        return res.status(200).json({
            success: true,
            user: user,
        });
    }
    catch (err) {
        console.error("Error getting user:", err);
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email, username } = req.body;
        const userId = req.params.userId;
        if (password) {
            req.body.password = bcrypt_1.default.hashSync(password, 10);
        }
        const updatedUser = yield User_1.default.findOneAndUpdate({ _id: userId }, {
            email: email,
            username: username,
            password: req.body.password,
            updatedAt: new Date(),
        }, {
            new: true,
            runValidators: true,
        })
            .populate("categories")
            .populate({
            path: "transactions",
            model: "Transaction",
            populate: {
                path: "category",
                model: "Category",
            },
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
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const user = yield User_1.default.findOne({ _id: userId }).select("categories transactions");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        yield Category_1.default.deleteMany({ _id: { $in: user.categories } });
        yield Transaction_1.default.deleteMany({ _id: { $in: user.transactions } });
        yield User_1.default.findOneAndDelete({ _id: userId });
        return res.status(200).json({
            success: true,
            user: user,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.deleteUser = deleteUser;
