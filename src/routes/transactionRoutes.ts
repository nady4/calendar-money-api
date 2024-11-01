import { Router } from "express";
//import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "../controllers/transactions";

const router = Router();

router.get("/:username/transactions", (req, res) => {
  //  getTransactions(req, res);
});

router.post("/:username/transactions", (req, res) => {
  //  addTransaction(req, res);
});

router.put("/:username/transactions", (req, res) => {
  //  updateTransaction(req, res);
});

router.delete("/:username/transactions", (req, res) => {
  //  deleteTransaction(req, res);
});

export default router;
