import { Router } from "express";
import multer from "multer";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
} from "../controllers/transactions";
import { scanInvoice } from "../controllers/scan";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

const scanUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/transactions/bulk/:userId", verifyToken, (req, res) => {
  bulkImport(req, res);
});

router.post(
  "/transactions/scan/:userId",
  verifyToken,
  scanUpload.single("image"),
  (req, res) => {
    scanInvoice(req, res);
  }
);

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
