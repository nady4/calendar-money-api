import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/users";
import {
  setVisionKey,
  removeVisionKey,
  getVisionKeyStatus,
} from "../controllers/visionKey";
const { verifyToken } = require("../middlewares/verifyToken");

const router = Router();

router.get("/users/:userId", verifyToken, (req, res) => {
  getUser(req, res);
});

router.put("/users/:userId", verifyToken, (req, res) => {
  updateUser(req, res);
});

router.delete("/users/:userId", verifyToken, (req, res) => {
  deleteUser(req, res);
});

router.get("/users/:userId/vision-key", verifyToken, (req, res) => {
  getVisionKeyStatus(req, res);
});

router.put("/users/:userId/vision-key", verifyToken, (req, res) => {
  setVisionKey(req, res);
});

router.delete("/users/:userId/vision-key", verifyToken, (req, res) => {
  removeVisionKey(req, res);
});

export default router;
