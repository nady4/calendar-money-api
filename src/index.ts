process.loadEnvFile();
import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { connectDB } from "./util/connectDB";

const app = express();

app.use(express.json());
app.use(authRoutes);
app.use(userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`💚 app is running on 🔌 port ${process.env.PORT}`);
});

connectDB();
