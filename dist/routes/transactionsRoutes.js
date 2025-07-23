"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_1 = require("../controllers/transactions");
const { verifyToken } = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.post("/transactions/:userId", verifyToken, (req, res) => {
    (0, transactions_1.createTransaction)(req, res);
});
router.put("/transactions/:userId", verifyToken, (req, res) => {
    (0, transactions_1.updateTransaction)(req, res);
});
router.delete("/transactions/:userId", verifyToken, (req, res) => {
    (0, transactions_1.deleteTransaction)(req, res);
});
exports.default = router;
