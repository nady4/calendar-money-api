import { Router } from "express";
import { register, login, logout } from "../controllers/auth";

const router = Router();

router.post("/register", (req, res) => {
  register(req, res);
});

router.post("/login", (req, res) => {
  login(req, res);
});

router.post("/logout", (req, res) => {
  logout(req, res);
});

export default router;
