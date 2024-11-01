import { Router } from "express";
//import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "../controllers/transactions";

const router = Router();

router.get("/transactions/:username", (req, res) => {
  //  getTransactions(req, res);
});

router.post("/transactions", (req, res) => {
  //  addTransaction(req, res);
});

router.put("/transactions", (req, res) => {
  //  updateTransaction(req, res);
});

router.delete("/transactions", (req, res) => {
  //  deleteTransaction(req, res);
});

export default router;
