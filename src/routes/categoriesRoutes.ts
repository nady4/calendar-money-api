import { Router } from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

router.post("/categories/:userId", verifyToken, (req, res) => {
  createCategory(req, res);
});

router.put("/categories/:userId", verifyToken, (req, res) => {
  updateCategory(req, res);
});

router.delete("/categories/:userId", verifyToken, (req, res) => {
  deleteCategory(req, res);
});

export default router;
