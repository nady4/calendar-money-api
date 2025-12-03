// src/util/defaultData.ts
import Category from "../models/Category";
import Transaction from "../models/Transaction";
import User from "../models/User";

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

const defaultTransactions = [
  {
    description: "Monthly salary January 2024",
    amount: 2500,
    categoryName: "Salary",
    date: new Date("2024-01-05"),
    group: "Fixed",
  },
  {
    description: "Groceries supermarket",
    amount: 120,
    categoryName: "Food",
    date: new Date("2024-01-12"),
    group: "Variable",
  },
  {
    description: "Netflix subscription",
    amount: 12,
    categoryName: "Subscriptions",
    date: new Date("2024-02-01"),
    group: "Fixed",
  },
  {
    description: "Rent February 2024",
    amount: 600,
    categoryName: "Rent",
    date: new Date("2024-02-01"),
    group: "Fixed",
  },
  {
    description: "Public transport card",
    amount: 35,
    categoryName: "Transportation",
    date: new Date("2024-03-10"),
    group: "Variable",
  },
  {
    description: "Cinema with friends",
    amount: 40,
    categoryName: "Entertainment",
    date: new Date("2024-04-20"),
    group: "Leisure",
  },
  {
    description: "Investment in ETF",
    amount: 300,
    categoryName: "Investment",
    date: new Date("2024-05-15"),
    group: "Investment",
  },
  {
    description: "Vet visit",
    amount: 90,
    categoryName: "Pets",
    date: new Date("2024-06-18"),
    group: "Health",
  },
  {
    description: "Gift for birthday",
    amount: 70,
    categoryName: "Gift",
    date: new Date("2024-08-05"),
    group: "Special",
  },
  {
    description: "Loan received",
    amount: 500,
    categoryName: "Loan",
    date: new Date("2024-09-10"),
    group: "Income",
  },
  {
    description: "Weekend trip",
    amount: 350,
    categoryName: "Travel",
    date: new Date("2025-01-25"),
    group: "Leisure",
  },
  {
    description: "Monthly salary March 2025",
    amount: 2700,
    categoryName: "Salary",
    date: new Date("2025-03-05"),
    group: "Fixed",
  },
  {
    description: "Online course",
    amount: 150,
    categoryName: "Education",
    date: new Date("2025-04-02"),
    group: "Investment",
  },
  {
    description: "Electricity bill",
    amount: 80,
    categoryName: "Services",
    date: new Date("2025-05-10"),
    group: "Fixed",
  },
  {
    description: "Clothes shopping",
    amount: 200,
    categoryName: "Shopping",
    date: new Date("2025-07-19"),
    group: "Variable",
  },
  {
    description: "Dentist appointment",
    amount: 130,
    categoryName: "Health",
    date: new Date("2025-09-03"),
    group: "Health",
  },
  {
    description: "Freelance extra income",
    amount: 400,
    categoryName: "Other Income",
    date: new Date("2025-10-11"),
    group: "Side job",
  },
  {
    description: "Debt payment",
    amount: 250,
    categoryName: "Debt",
    date: new Date("2025-11-20"),
    group: "Debt",
  },
  {
    description: "Monthly salary January 2026",
    amount: 2900,
    categoryName: "Salary",
    date: new Date("2026-01-05"),
    group: "Fixed",
  },
  {
    description: "Streaming bundle",
    amount: 25,
    categoryName: "Subscriptions",
    date: new Date("2026-02-01"),
    group: "Fixed",
  },
  {
    description: "Groceries and hygiene",
    amount: 160,
    categoryName: "Food",
    date: new Date("2026-03-09"),
    group: "Essentials",
  },
  {
    description: "Gym membership",
    amount: 50,
    categoryName: "Health",
    date: new Date("2026-04-03"),
    group: "Health",
  },
  {
    description: "Fuel",
    amount: 70,
    categoryName: "Transportation",
    date: new Date("2026-05-14"),
    group: "Variable",
  },
  {
    description: "Tech gadget",
    amount: 320,
    categoryName: "Shopping",
    date: new Date("2026-06-22"),
    group: "Variable",
  },
  {
    description: "Bonus Q1 2024",
    amount: 800,
    categoryName: "Salary",
    date: new Date("2024-03-25"),
    group: "Income",
  },
  {
    description: "Coffee and snacks",
    amount: 18,
    categoryName: "Food",
    date: new Date("2024-02-10"),
    group: "Daily",
  },
  {
    description: "Lunch at restaurant",
    amount: 35,
    categoryName: "Food",
    date: new Date("2024-02-10"),
    group: "Daily",
  },
  {
    description: "Spotify subscription",
    amount: 9,
    categoryName: "Subscriptions",
    date: new Date("2024-02-15"),
    group: "Fixed",
  },
  {
    description: "Mobile phone bill",
    amount: 45,
    categoryName: "Services",
    date: new Date("2024-02-15"),
    group: "Fixed",
  },
  {
    description: "Bus tickets",
    amount: 22,
    categoryName: "Transportation",
    date: new Date("2024-03-02"),
    group: "Variable",
  },
  {
    description: "Taxi after night out",
    amount: 28,
    categoryName: "Transportation",
    date: new Date("2024-03-02"),
    group: "Leisure",
  },
  {
    description: "Online game purchase",
    amount: 30,
    categoryName: "Entertainment",
    date: new Date("2024-03-18"),
    group: "Leisure",
  },
  {
    description: "Streaming movie rental",
    amount: 7,
    categoryName: "Entertainment",
    date: new Date("2024-03-18"),
    group: "Leisure",
  },
  {
    description: "Investment in crypto",
    amount: 250,
    categoryName: "Investment",
    date: new Date("2024-04-07"),
    group: "Investment",
  },
  {
    description: "Investment in stocks",
    amount: 400,
    categoryName: "Investment",
    date: new Date("2024-04-07"),
    group: "Investment",
  },
  {
    description: "Shampoo and soap",
    amount: 20,
    categoryName: "Higiene",
    date: new Date("2024-04-12"),
    group: "Essentials",
  },
  {
    description: "Toothpaste and deodorant",
    amount: 16,
    categoryName: "Higiene",
    date: new Date("2024-04-12"),
    group: "Essentials",
  },
  {
    description: "Books for self-study",
    amount: 90,
    categoryName: "Education",
    date: new Date("2024-05-03"),
    group: "Learning",
  },
  {
    description: "Online workshop fee",
    amount: 60,
    categoryName: "Education",
    date: new Date("2024-05-03"),
    group: "Learning",
  },
  {
    description: "Pet food large bag",
    amount: 55,
    categoryName: "Pets",
    date: new Date("2024-06-01"),
    group: "Pets",
  },
  {
    description: "Pet toys and snacks",
    amount: 25,
    categoryName: "Pets",
    date: new Date("2024-06-01"),
    group: "Pets",
  },
  {
    description: "Electricity invoice mid-2024",
    amount: 95,
    categoryName: "Services",
    date: new Date("2024-07-14"),
    group: "Fixed",
  },
  {
    description: "Internet provider bill",
    amount: 55,
    categoryName: "Services",
    date: new Date("2024-07-14"),
    group: "Fixed",
  },
  {
    description: "New sneakers",
    amount: 110,
    categoryName: "Shopping",
    date: new Date("2024-08-09"),
    group: "Clothes",
  },
  {
    description: "T-shirts and jeans",
    amount: 130,
    categoryName: "Shopping",
    date: new Date("2024-08-09"),
    group: "Clothes",
  },
  {
    description: "Medicine for flu",
    amount: 35,
    categoryName: "Health",
    date: new Date("2024-09-21"),
    group: "Health",
  },
  {
    description: "Routine check-up",
    amount: 75,
    categoryName: "Health",
    date: new Date("2024-09-21"),
    group: "Health",
  },
  {
    description: "Birthday dinner out",
    amount: 95,
    categoryName: "Food",
    date: new Date("2024-10-18"),
    group: "Special",
  },
  {
    description: "Gift card for friend",
    amount: 50,
    categoryName: "Gift",
    date: new Date("2024-10-18"),
    group: "Special",
  },
  {
    description: "Side job payment November 2024",
    amount: 380,
    categoryName: "Other Income",
    date: new Date("2024-11-09"),
    group: "Side job",
  },
  {
    description: "Loan installment November 2024",
    amount: 210,
    categoryName: "Debt",
    date: new Date("2024-11-09"),
    group: "Debt",
  },
  {
    description: "Year-end bonus 2024",
    amount: 900,
    categoryName: "Salary",
    date: new Date("2024-12-20"),
    group: "Income",
  },
  {
    description: "New year’s party expenses",
    amount: 160,
    categoryName: "Entertainment",
    date: new Date("2024-12-31"),
    group: "Leisure",
  },
  {
    description: "Groceries first week 2025",
    amount: 140,
    categoryName: "Food",
    date: new Date("2025-01-06"),
    group: "Essentials",
  },
  {
    description: "Gas for heating",
    amount: 85,
    categoryName: "Services",
    date: new Date("2025-02-02"),
    group: "Fixed",
  },
  {
    description: "Monthly bus pass",
    amount: 60,
    categoryName: "Transportation",
    date: new Date("2025-02-02"),
    group: "Fixed",
  },
  {
    description: "Conference ticket",
    amount: 220,
    categoryName: "Education",
    date: new Date("2025-03-19"),
    group: "Learning",
  },
  {
    description: "Hotel for conference",
    amount: 310,
    categoryName: "Travel",
    date: new Date("2025-03-19"),
    group: "Work travel",
  },
  {
    description: "Pet vaccination",
    amount: 95,
    categoryName: "Pets",
    date: new Date("2025-04-27"),
    group: "Health",
  },
  {
    description: "House cleaning supplies",
    amount: 32,
    categoryName: "Other Expenses",
    date: new Date("2025-05-11"),
    group: "Essentials",
  },
  {
    description: "Random online impulse buy",
    amount: 60,
    categoryName: "Shopping",
    date: new Date("2025-05-11"),
    group: "Variable",
  },
  {
    description: "Extra shift income",
    amount: 190,
    categoryName: "Other Income",
    date: new Date("2025-06-08"),
    group: "Income",
  },
  {
    description: "Debt principal reduction",
    amount: 300,
    categoryName: "Debt",
    date: new Date("2025-06-08"),
    group: "Debt",
  },
  {
    description: "City break weekend",
    amount: 280,
    categoryName: "Travel",
    date: new Date("2025-08-15"),
    group: "Leisure",
  },
  {
    description: "Museum and attractions tickets",
    amount: 75,
    categoryName: "Entertainment",
    date: new Date("2025-08-15"),
    group: "Leisure",
  },
  {
    description: "Annual domain renewal",
    amount: 20,
    categoryName: "Services",
    date: new Date("2025-09-30"),
    group: "Fixed",
  },
  {
    description: "Cloud service subscription",
    amount: 12,
    categoryName: "Subscriptions",
    date: new Date("2025-09-30"),
    group: "Fixed",
  },
  {
    description: "New winter jacket",
    amount: 180,
    categoryName: "Shopping",
    date: new Date("2025-11-05"),
    group: "Clothes",
  },
  {
    description: "Charity donation end of 2025",
    amount: 70,
    categoryName: "Other Expenses",
    date: new Date("2025-12-22"),
    group: "Donation",
  },
  {
    description: "Salary raise adjustment 2026",
    amount: 300,
    categoryName: "Salary",
    date: new Date("2026-02-10"),
    group: "Income",
  },
  {
    description: "Groceries mid-2026",
    amount: 155,
    categoryName: "Food",
    date: new Date("2026-06-04"),
    group: "Essentials",
  },
  {
    description: "Weekend streaming marathon snacks",
    amount: 26,
    categoryName: "Food",
    date: new Date("2026-06-04"),
    group: "Leisure",
  },
  {
    description: "Eye exam and glasses",
    amount: 260,
    categoryName: "Health",
    date: new Date("2026-07-19"),
    group: "Health",
  },
  {
    description: "Online subscription bundle 2026",
    amount: 32,
    categoryName: "Subscriptions",
    date: new Date("2026-09-01"),
    group: "Fixed",
  },
  {
    description: "Final loan payoff",
    amount: 520,
    categoryName: "Debt",
    date: new Date("2026-10-10"),
    group: "Debt",
  },
  {
    description: "Investment rebalance 2026",
    amount: 450,
    categoryName: "Investment",
    date: new Date("2026-11-23"),
    group: "Investment",
  },
  {
    description: "Year-end celebration 2026",
    amount: 210,
    categoryName: "Entertainment",
    date: new Date("2026-12-31"),
    group: "Leisure",
  },
];

export const insertDefaultCategories = async () => {
  try {
    const categoriesCollections = await Category.insertMany(defaultCategories, {
      ordered: false,
    });
    return categoriesCollections.map((cat) => cat._id);
  } catch (error) {
    const existingCategories = await Category.find({
      name: { $in: defaultCategories.map((cat) => cat.name) },
    });
    return existingCategories.map((cat) => cat._id);
  }
};

export const insertDefaultTransactions = async (userId: string) => {
  const categoryNames = defaultTransactions.map((t) => t.categoryName);
  const categories = await Category.find({ name: { $in: categoryNames } });

  const categoriesByName = new Map<string, string>(
    categories.map((cat) => [cat.name, String(cat._id)])
  );

  const transactionsToInsert = defaultTransactions
    .filter((t) => categoriesByName.has(t.categoryName))
    .map((t) => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: categoriesByName.get(t.categoryName),
      group: t.group,
    }));

  if (!transactionsToInsert.length) {
    return [];
  }

  const createdTransactions = await Transaction.insertMany(
    transactionsToInsert
  );

  await User.findByIdAndUpdate(userId, {
    $push: {
      transactions: {
        $each: createdTransactions.map((t) => t._id),
      },
    },
  });

  return createdTransactions.map((t) => t._id);
};
