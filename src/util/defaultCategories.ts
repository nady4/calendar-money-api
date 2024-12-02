import Category from "../models/Category";

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
