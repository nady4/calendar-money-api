import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  group: {
    type: String,
    required: false,
  },
});

export default mongoose.model("Transaction", transactionSchema);
