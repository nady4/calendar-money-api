import Category from "../models/Category";

const defaultCategories = [
  { name: "Salary", color: "#4CAF50", type: "Income" },
  { name: "Investment", color: "#37b01c", type: "Income" },
  { name: "Loan", color: "#FFC107", type: "Income" },
  { name: "Rent", color: "#607D8B", type: "Expense" },
  { name: "Food", color: "#e31b22", type: "Expense" },
  { name: "Entertainment", color: "#2196F3", type: "Expense" },
  { name: "Shopping", color: "#9C27B0", type: "Expense" },
  { name: "Transportation", color: "#3F51B5", type: "Expense" },
  { name: "Health", color: "#E91E63", type: "Expense" },
  { name: "Education", color: "#FFC107", type: "Expense" },
  { name: "Gift", color: "#FF5722", type: "Expense" },
  { name: "Travel", color: "#4CAF50", type: "Expense" },
  { name: "Debt", color: "#9C27B0", type: "Expense" },
  { name: "Other", color: "#795548", type: "Expense" },
];

export const insertDefaultCategories = async () => {
  try {
    const categoriesCollections = await Category.insertMany(defaultCategories, {
      ordered: false,
    });
    return categoriesCollections.map((cat) => cat._id);
  } catch (error) {
    console.log("Some default categories already exist, skipping duplicates.");
    const existingCategories = await Category.find({
      name: { $in: defaultCategories.map((cat) => cat.name) },
    });
    return existingCategories.map((cat) => cat._id);
  }
};
