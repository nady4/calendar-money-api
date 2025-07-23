"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../controllers/categories");
const { verifyToken } = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.post("/categories/:userId", verifyToken, (req, res) => {
    (0, categories_1.createCategory)(req, res);
});
router.put("/categories/:userId", verifyToken, (req, res) => {
    (0, categories_1.updateCategory)(req, res);
});
router.delete("/categories/:userId", verifyToken, (req, res) => {
    (0, categories_1.deleteCategory)(req, res);
});
exports.default = router;
