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
exports.insertDefaultCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const defaultCategories = [
    { name: "Salary", color: "#1fff00", type: "Income" },
    { name: "Investment", color: "#37b01c", type: "Income" },
    { name: "Loan", color: "#FFC107", type: "Income" },
    { name: "Rent", color: "#607D8B", type: "Expense" },
    { name: "Food", color: "#e31b22", type: "Expense" },
    { name: "Entertainment", color: "#ff00b3", type: "Expense" },
    { name: "Shopping", color: "#9C27B0", type: "Expense" },
    { name: "Transportation", color: "#3F51B5", type: "Expense" },
    { name: "Health", color: "#ff0000", type: "Expense" },
    { name: "Higiene", color: "#03cffc", type: "Expense" },
    { name: "Education", color: "#00c0ff", type: "Expense" },
    { name: "Gift", color: "#ff00c2", type: "Expense" },
    { name: "Travel", color: "#00ffec", type: "Expense" },
    { name: "Debt", color: "#9C27B0", type: "Expense" },
    { name: "Services", color: "#795548", type: "Expense" },
    { name: "Subscriptions", color: "#03fc41", type: "Expense" },
    { name: "Pets", color: "#fc7703", type: "Expense" },
    { name: "Other Expenses", color: "#795548", type: "Expense" },
    { name: "Other Income", color: "#795548", type: "Income" },
];
const insertDefaultCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoriesCollections = yield Category_1.default.insertMany(defaultCategories, {
            ordered: false,
        });
        return categoriesCollections.map((cat) => cat._id);
    }
    catch (error) {
        console.log("Some default categories already exist, skipping duplicates.");
        const existingCategories = yield Category_1.default.find({
            name: { $in: defaultCategories.map((cat) => cat.name) },
        });
        return existingCategories.map((cat) => cat._id);
    }
});
exports.insertDefaultCategories = insertDefaultCategories;
