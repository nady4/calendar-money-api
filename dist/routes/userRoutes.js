"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const { verifyToken } = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.get("/users/:userId", verifyToken, (req, res) => {
    (0, users_1.getUser)(req, res);
});
router.put("/users/:userId", verifyToken, (req, res) => {
    (0, users_1.updateUser)(req, res);
});
router.delete("/users/:userId", verifyToken, (req, res) => {
    (0, users_1.deleteUser)(req, res);
});
exports.default = router;
