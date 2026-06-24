import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      (process.env.DB_URL ?? process.env.MONGODB_URL) as string,
    );
    console.log(`🟢 MongoDB connected: ${conn.connection.host}\n`);
  } catch (error: any) {
    console.log(`🔴 Database connection error: ${error.message}\n`);
    process.exit(1);
  }
};
