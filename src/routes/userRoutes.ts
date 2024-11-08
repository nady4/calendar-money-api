import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/users";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

router.get("/user", verifyToken, (req, res) => {
  getUser(req, res);
});

router.put("/user", verifyToken, (req, res) => {
  updateUser(req, res);
});

router.delete("/user", verifyToken, (req, res) => {
  deleteUser(req, res);
});

export default router;
