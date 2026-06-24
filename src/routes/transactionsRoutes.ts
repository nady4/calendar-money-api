import { Router } from "express";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
} from "../controllers/transactions";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

router.post("/transactions/bulk/:userId", verifyToken, (req, res) => {
  bulkImport(req, res);
});

router.post("/transactions/:userId", verifyToken, (req, res) => {
  createTransaction(req, res);
});

router.put("/transactions/:userId", verifyToken, (req, res) => {
  updateTransaction(req, res);
});

router.delete("/transactions/:userId", verifyToken, (req, res) => {
  deleteTransaction(req, res);
});

export default router;
