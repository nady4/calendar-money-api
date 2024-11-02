import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/users";

const router = Router();

router.get("/:username", (req, res) => {
  getUser(req, res);
});

router.put("/:username", (req, res) => {
  updateUser(req, res);
});

router.delete("/:username", (req, res) => {
  deleteUser(req, res);
});

export default router;
