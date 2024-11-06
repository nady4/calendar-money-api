import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/users";
const { verifyToken } = require("../util/verifyToken");

const router = Router();

router.get("/users", (req, res) => {
  verifyToken(req, res);
  getUser(req, res);
});

router.put("/users", async (req, res) => {
  verifyToken(req, res);
  await updateUser(req, res);
});

router.delete("/users", (req, res) => {
  verifyToken(req, res);
  deleteUser(req, res);
});

export default router;
