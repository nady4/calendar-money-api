import { Router } from "express";
//import { getCategories, addCategory, updateCategory, deleteCategory } from "../controllers/categories";

const router = Router();

router.get("/:username/categories", (req, res) => {
  //  getCategories(req, res);
});

router.post("/:username/categories", (req, res) => {
  //  addCategory(req, res);
});

router.put("/:username/categories", (req, res) => {
  //  updateCategory(req, res);
});

router.delete("/:username/categories", (req, res) => {
  //  deleteCategory(req, res);
});

export default router;
