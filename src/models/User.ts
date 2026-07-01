import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: [],
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: [],
    },
  ],
  scanUsage: {
    day: { type: String, default: "" },
    dayCount: { type: Number, default: 0 },
    month: { type: String, default: "" },
    monthCount: { type: Number, default: 0 },
    lastScanAt: { type: Date, default: null },
  },
  visionApiKeyEnc: {
    ciphertext: { type: String, default: null },
    iv: { type: String, default: null },
    authTag: { type: String, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
