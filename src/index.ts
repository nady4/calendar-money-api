process.loadEnvFile();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import transactionsRoutes from "./routes/transactionsRoutes";
import { connectDB } from "./util/connectDB";

connectDB();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(authRoutes);
app.use(userRoutes);
app.use(categoriesRoutes);
app.use(transactionsRoutes);

app.listen(process.env.PORT, () => {
  console.log(`💚 app is running on 🔌 port ${process.env.PORT}`);
});
