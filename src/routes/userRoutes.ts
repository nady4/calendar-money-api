import { Router } from "express";
import { getUser, addUser, updateUser, deleteUser } from "../controllers/users";

const router = Router();

router.get("/:username", (req, res) => {
  getUser(req, res);
});

router.post("/", (req, res) => {
  addUser(req, res);
});

router.put("/", (req, res) => {
  updateUser(req, res);
});

router.delete("/", (req, res) => {
  deleteUser(req, res);
});

export default router;
