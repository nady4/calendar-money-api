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
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = void 0;
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const uuid_1 = require("uuid");
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, amount, description, category, repeats } = req.body;
        const userId = req.params.userId;
        const group = (0, uuid_1.v4)();
        const transaction = new Transaction_1.default({
            date,
            amount,
            description,
            category,
            group: repeats ? group : null,
        });
        yield transaction.save();
        const updatedUser = yield User_1.default.findOneAndUpdate({ _id: userId }, {
            $push: { transactions: transaction._id },
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
        if (repeats) {
            const repeatedTransactions = [];
            for (let i = 1; i <= 12; i++) {
                const newTransaction = new Transaction_1.default({
                    date: new Date(new Date(date).getFullYear(), new Date(date).getMonth() + i, new Date(date).getDate()),
                    amount,
                    description,
                    category,
                    group,
                });
                const savedTransaction = yield newTransaction.save();
                repeatedTransactions.push(savedTransaction._id);
                updatedUser.transactions.push(savedTransaction._id);
            }
            yield updatedUser.save();
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
exports.createTransaction = createTransaction;
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, date, amount, description, category, group } = req.body;
        const updatedTransaction = yield Transaction_1.default.findOneAndUpdate({ _id: id }, {
            date,
            amount,
            description,
            category,
        }, {
            new: true,
            runValidators: true,
        });
        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                error: "Transaction not found",
            });
        }
        if (group) {
            yield Transaction_1.default.updateMany({ group: group }, {
                date,
                amount,
                description,
                category,
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
exports.updateTransaction = updateTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const userId = req.params.userId;
        const transactionToDelete = yield Transaction_1.default.findById(id);
        if (!transactionToDelete) {
            return res.status(404).json({
                success: false,
                error: "Transaction not found",
            });
        }
        const group = transactionToDelete.group;
        const updatedUser = yield User_1.default.findOneAndUpdate({ _id: userId }, {
            $pull: {
                transactions: {
                    $in: group
                        ? yield Transaction_1.default.find({ group }).distinct("_id")
                        : [id],
                },
            },
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
        if (group) {
            yield Transaction_1.default.deleteMany({ group });
        }
        else {
            yield Transaction_1.default.findOneAndDelete({ _id: id });
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
exports.deleteTransaction = deleteTransaction;
