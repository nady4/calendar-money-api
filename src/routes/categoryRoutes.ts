import { Router } from "express";
//import { getCategories, addCategory, updateCategory, deleteCategory } from "../controllers/categories";

const router = Router();

router.get("/categories/:username", (req, res) => {
  //  getCategories(req, res);
});

router.post("/categories", (req, res) => {
  //  addCategory(req, res);
});

router.put("/categories", (req, res) => {
  //  updateCategory(req, res);
});

router.delete("/categories", (req, res) => {
  //  deleteCategory(req, res);
});

export default router;
