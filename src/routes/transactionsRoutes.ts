import { Router, Request, Response } from "express";
import multer from "multer";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
} from "../controllers/transactions";
import { scanInvoice, getScanQuota } from "../controllers/scan";
import handleMulterError from "../middlewares/handleMulterError";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const scanUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype || "unknown"}`));
      return;
    }
    cb(null, true);
  },
});

router.post("/transactions/bulk/:userId", verifyToken, (req: Request, res: Response) => {
  bulkImport(req, res);
});

router.post(
  "/transactions/scan/:userId",
  verifyToken,
  scanUpload.single("image"),
  handleMulterError,
  (req: Request, res: Response) => {
    scanInvoice(req, res);
  }
);

router.get("/users/:userId/scan-quota", verifyToken, (req: Request, res: Response) => {
  getScanQuota(req, res);
});

router.post("/transactions/:userId", verifyToken, (req: Request, res: Response) => {
  createTransaction(req, res);
});

router.put("/transactions/:userId", verifyToken, (req: Request, res: Response) => {
  updateTransaction(req, res);
});

router.delete("/transactions/:userId", verifyToken, (req: Request, res: Response) => {
  deleteTransaction(req, res);
});

export default router;
