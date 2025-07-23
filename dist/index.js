"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.loadEnvFile();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const categoriesRoutes_1 = __importDefault(require("./routes/categoriesRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
const connectDB_1 = require("./util/connectDB");
(0, connectDB_1.connectDB)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "*" }));
app.use(authRoutes_1.default);
app.use(userRoutes_1.default);
app.use(categoriesRoutes_1.default);
app.use(transactionsRoutes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`\n💚 app is running on 🔌 port ${process.env.PORT}`);
});
