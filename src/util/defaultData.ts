// src/util/defaultData.ts
import { v4 as uuidv4 } from "uuid";
import Category from "../models/Category";
import Transaction from "../models/Transaction";
import User from "../models/User";

// Relatable, well-rounded default categories with distinct colors.
const defaultCategories = [
  // --- Income ---
  { name: "Salary", color: "#4caf50", type: "Income" },
  { name: "Freelance", color: "#26a69a", type: "Income" },
  { name: "Bonus", color: "#689f38", type: "Income" },
  { name: "Refund", color: "#aed581", type: "Income" },
  // --- Expense ---
  { name: "Rent", color: "#f44336", type: "Expense" },
  { name: "Groceries", color: "#ff9800", type: "Expense" },
  { name: "Utilities", color: "#9c27b0", type: "Expense" },
  { name: "Transport", color: "#2196f3", type: "Expense" },
  { name: "Dining Out", color: "#e91e63", type: "Expense" },
  { name: "Entertainment", color: "#3f51b5", type: "Expense" },
  { name: "Shopping", color: "#ffc107", type: "Expense" },
  { name: "Health", color: "#fb5607", type: "Expense" },
  { name: "Subscriptions", color: "#00bcd4", type: "Expense" },
  { name: "Travel", color: "#8338ec", type: "Expense" },
  { name: "Gym", color: "#ff006e", type: "Expense" },
  { name: "Phone", color: "#fb8500", type: "Expense" },
  { name: "Education", color: "#009688", type: "Expense" },
  { name: "Pets", color: "#cddc39", type: "Expense" },
];

// Deterministic PRNG so re-runs produce identical data.
let _s = 0x1a2b3c4d;
const rng = () => {
  _s = (_s * 1664525 + 1013904223) >>> 0;
  return _s / 0xffffffff;
};
const rint = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;
const rfloat = (min: number, max: number) =>
  +(rng() * (max - min) + min).toFixed(2);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const lastDay = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

// Today, used to avoid seeding non-recurring transactions in the future.
const TODAY = new Date(2026, 5, 24); // 2026-06-24
const isFuture = (d: Date) => d > TODAY;

type SeedTx = {
  description: string;
  amount: number;
  categoryName: string;
  date: Date;
  group?: string;
};

// Build a relatable transaction history across 2025 & 2026.
// Recurring monthly series share a `group` id so the UI treats them as one
// repeat group (edit one -> updates all, delete one -> removes the series).
const buildDefaultTransactions = (): SeedTx[] => {
  const txs: SeedTx[] = [];
  const add = (
    categoryName: string,
    date: Date,
    amount: number,
    description: string,
    group?: string,
  ) => {
    if (isFuture(date)) return;
    txs.push({ categoryName, date, amount, description, group });
  };

  // Shared group ids for each recurring monthly series.
  const groups = {
    salary: uuidv4(),
    rent: uuidv4(),
    utilities: uuidv4(),
    phone: uuidv4(),
    subscriptions: uuidv4(),
    gym: uuidv4(),
    transport: uuidv4(),
  };

  const months: { y: number; m: number }[] = [];
  for (let y = 2025; y <= 2026; y++)
    for (let m = 1; m <= 12; m++) months.push({ y, m });

  months.forEach(({ y, m }) => {
    // --- Recurring income / fixed expenses (monthly series) ---
    add("Salary", new Date(y, m - 1, 1), 3200, "Monthly salary", groups.salary);
    add("Rent", new Date(y, m - 1, 3), 1100, "Apartment rent", groups.rent);
    add(
      "Utilities",
      new Date(y, m - 1, 12),
      rfloat(110, 180),
      "Electricity & water",
      groups.utilities,
    );
    add("Phone", new Date(y, m - 1, 15), 35, "Phone plan", groups.phone);
    add(
      "Subscriptions",
      new Date(y, m - 1, 5),
      24.99,
      "Streaming & cloud",
      groups.subscriptions,
    );
    add("Gym", new Date(y, m - 1, 7), 29, "Gym membership", groups.gym);
    add(
      "Transport",
      new Date(y, m - 1, 20),
      65,
      "Monthly transit pass",
      groups.transport,
    );

    // --- Variable expenses ---
    const groceryTrips = rint(2, 3);
    for (let i = 0; i < groceryTrips; i++)
      add(
        "Groceries",
        new Date(y, m - 1, rint(2, lastDay(y, m) - 1)),
        rfloat(45, 110),
        pick(["Weekly groceries", "Costco run", "Local market"]),
      );

    const diningTrips = rint(1, 3);
    for (let i = 0; i < diningTrips; i++)
      add(
        "Dining Out",
        new Date(y, m - 1, rint(4, lastDay(y, m) - 2)),
        rfloat(15, 70),
        pick(["Dinner with friends", "Lunch out", "Pizza night", "Brunch"]),
      );

    if (rng() > 0.3)
      add(
        "Shopping",
        new Date(y, m - 1, rint(6, 26)),
        rfloat(25, 220),
        pick(["Clothes", "Home essentials", "Electronics", "Gift"]),
      );

    if (rng() > 0.4)
      add(
        "Entertainment",
        new Date(y, m - 1, rint(3, 27)),
        rfloat(15, 60),
        pick(["Cinema", "Concert tickets", "Steam game", "Board game night"]),
      );

    // Freelance gig roughly every other month.
    if (rng() > 0.5)
      add(
        "Freelance",
        new Date(y, m - 1, rint(8, 22)),
        rint(300, 900),
        "Freelance project",
      );

    // Pet expenses every few months.
    if (rng() > 0.75)
      add(
        "Pets",
        new Date(y, m - 1, rint(5, 24)),
        rfloat(20, 80),
        pick(["Pet food", "Vet visit", "Pet toys"]),
      );
  });

  // --- Occasional big-ticket & one-off items ---
  const oneOffs: SeedTx[] = [
    { categoryName: "Travel", date: new Date(2025, 2, 15), amount: 850, description: "Spring break trip" },
    { categoryName: "Travel", date: new Date(2025, 6, 10), amount: 1450, description: "Summer vacation" },
    { categoryName: "Travel", date: new Date(2025, 11, 22), amount: 600, description: "Holiday travel" },
    { categoryName: "Travel", date: new Date(2026, 1, 18), amount: 520, description: "Ski weekend" },
    { categoryName: "Travel", date: new Date(2026, 4, 20), amount: 980, description: "Beach trip" },

    { categoryName: "Health", date: new Date(2025, 1, 11), amount: 80, description: "Dental checkup" },
    { categoryName: "Health", date: new Date(2025, 8, 4), amount: 45, description: "Pharmacy" },
    { categoryName: "Health", date: new Date(2026, 0, 19), amount: 120, description: "Eye exam & glasses" },
    { categoryName: "Health", date: new Date(2026, 3, 8), amount: 35, description: "Pharmacy" },

    { categoryName: "Education", date: new Date(2025, 2, 19), amount: 220, description: "Conference ticket" },
    { categoryName: "Education", date: new Date(2025, 4, 3), amount: 90, description: "Books for self-study" },
    { categoryName: "Education", date: new Date(2026, 2, 12), amount: 150, description: "Online course" },

    { categoryName: "Refund", date: new Date(2025, 3, 14), amount: 540, description: "Tax refund" },
    { categoryName: "Refund", date: new Date(2026, 3, 12), amount: 610, description: "Tax refund" },

    { categoryName: "Bonus", date: new Date(2025, 11, 20), amount: 1600, description: "Year-end bonus" },
    { categoryName: "Bonus", date: new Date(2026, 5, 18), amount: 800, description: "Mid-year bonus" },
  ];
  oneOffs.forEach((t) => {
    if (!isFuture(t.date)) txs.push(t);
  });

  return txs;
};

const defaultTransactions = buildDefaultTransactions();

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
    categories.map((cat) => [cat.name, String(cat._id)]),
  );

  const transactionsToInsert = defaultTransactions
    .filter((t) => categoriesByName.has(t.categoryName))
    .map((t) => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: categoriesByName.get(t.categoryName) as string,
      group: t.group ?? null,
    }));

  if (!transactionsToInsert.length) {
    return [];
  }

  const createdTransactions = await Transaction.insertMany(
    transactionsToInsert,
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
