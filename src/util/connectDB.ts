import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URL || "mongodb://localhost:27017/personal-finance"
    );
    console.log(`🟢 MongoDB connected: ${conn.connection.host}\n`);
  } catch (error: any) {
    console.log(`🔴 Database connection error: ${error.message}\n`);
    process.exit(1);
  }
};
