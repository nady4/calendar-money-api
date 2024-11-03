import { Router, RequestHandler } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/users";
import { verifyToken } from "../util/verifyToken";

const router = Router();

router.get("/:username", (req, res) => {
  getUser(req, res);
});

router.put("/:username", (req, res) => {
  verifyToken(req, res, async () => {
    await updateUser(req, res);
  });
});

router.delete("/:username", (req, res) => {
  deleteUser(req, res);
});

export default router;
