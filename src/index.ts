process.loadEnvFile();
import { connectDB } from "./util/connectDB";
import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import categoryRoutes from "./routes/categoryRoutes";

const app = express();

app.use(express.json());
app.use(authRoutes);
app.use(userRoutes);
app.use(transactionRoutes);
app.use(categoryRoutes);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

connectDB();
