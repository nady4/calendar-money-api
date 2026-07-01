// src/scripts/resetScanQuota.ts
//
// Resets the scan quota counters for the seeded dev user without touching
// transactions or categories. Safe to run repeatedly.
//
//   DB_URL=... npx ts-node src/scripts/resetScanQuota.ts

import mongoose from "mongoose";
import User from "../models/User";

const USERNAME = "nady4";
const EMAIL = "dev@nady4.com";

const MONGO_URL = process.env.DB_URL ?? process.env.MONGODB_URL;
if (!MONGO_URL) {
  console.error("DB_URL (or MONGODB_URL) env var is required");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URL as string);
  console.log("connected to DB");

  const result = await User.updateMany(
    { $or: [{ username: USERNAME }, { email: EMAIL }] },
    {
      $set: {
        scanUsage: {
          day: "",
          dayCount: 0,
          month: "",
          monthCount: 0,
          lastScanAt: null,
        },
      },
    }
  );

  console.log(`reset scan quota on ${result.modifiedCount} user(s)`);
  await mongoose.disconnect();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
