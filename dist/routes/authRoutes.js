"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
router.post("/register", (req, res) => {
    (0, auth_1.register)(req, res);
});
router.post("/login", (req, res) => {
    (0, auth_1.login)(req, res);
});
router.post("/logout", (req, res) => {
    (0, auth_1.logout)(req, res);
});
exports.default = router;
