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
exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const User_1 = __importDefault(require("../models/User"));
const Category_1 = __importDefault(require("../models/Category"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, color, type } = req.body;
        const userId = req.params.userId;
        const category = new Category_1.default({
            name,
            color,
            type,
        });
        yield category.save();
        const updatedUser = yield User_1.default.findOneAndUpdate({ _id: userId }, {
            $push: { categories: category._id },
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
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, color, type } = req.body;
        const updatedCategory = yield Category_1.default.findOneAndUpdate({ _id: id }, {
            name,
            color,
            type,
        }, {
            new: true,
            runValidators: true,
        });
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }
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
        return res.status(200).json({
            success: true,
            user,
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
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const userId = req.params.userId;
        const updatedUser = yield User_1.default.findOneAndUpdate({ _id: userId }, {
            $pull: { categories: id },
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
        yield Category_1.default.findOneAndDelete({ _id: id });
        yield Transaction_1.default.deleteMany({ category: id });
        return res.status(200).json({
            success: true,
            user: updatedUser,
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
exports.deleteCategory = deleteCategory;
