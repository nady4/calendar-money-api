// src/scripts/seedUser.ts
//
// (Re)creates the dev user directly in the database with the default
// categories + transactions. Bypasses the /register password rules, so the
// short password "nady4" can be used for the dev account.
//
//   DB_URL=... npx ts-node src/scripts/seedUser.ts
//   DB_URL=... npx ts-node src/scripts/seedUser.ts --keep   # don't delete existing

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User";
import Category from "../models/Category";
import Transaction from "../models/Transaction";
import {
  insertDefaultCategories,
  insertDefaultTransactions,
} from "../util/defaultData";

const USERNAME = "nady4";
const EMAIL = "dev@nady4.com";
const PASSWORD = "nady4";
const KEEP = process.argv.includes("--keep");

const MONGO_URL = process.env.DB_URL ?? process.env.MONGODB_URL;
if (!MONGO_URL) {
  console.error("DB_URL (or MONGODB_URL) env var is required");
  process.exit(1);
}

async function wipeExisting() {
  // Wipe the seeded username and any stale user holding the seeded email,
  // since `email` has a unique index and would otherwise cause E11000 on insert.
  const targets = await User.find({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  });
  for (const existing of targets) {
    await Transaction.deleteMany({ _id: { $in: existing.transactions } });
    await Category.deleteMany({ _id: { $in: existing.categories } });
    await User.deleteOne({ _id: existing._id });
    console.log(
      `deleted existing user "${existing.username}" (${existing.email}) and its data`,
    );
  }
}

async function main() {
  await mongoose.connect(MONGO_URL as string);
  console.log("connected to DB");

  if (!KEEP) await wipeExisting();

  const hash = bcrypt.hashSync(PASSWORD, 10);
  const categoryIds = await insertDefaultCategories();

  const user = new User({
    username: USERNAME,
    email: EMAIL,
    password: hash,
    categories: categoryIds,
  });
  await user.save();

  await insertDefaultTransactions(user._id.toString());

  const reloaded = await User.findById(user._id)
    .populate("categories")
    .populate("transactions");

  console.log(
    `seeded user "${USERNAME}" -> ${reloaded?.transactions.length} transactions, ${reloaded?.categories.length} categories`,
  );
  await mongoose.disconnect();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
