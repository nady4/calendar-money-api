import { Router } from "express";
import { register, login, logout } from "../controllers/auth";

const router = Router();

router.get("/register", (req, res) => {
  register(req, res);
});

router.get("/login", (req, res) => {
  login(req, res);
});

router.get("/logout", (req, res) => {
  logout(req, res);
});

export default router;
