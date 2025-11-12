import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://campus-connect-b5dq-git-main-campus-connects-projects-a4ef89de.vercel.app"
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Your routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

// Mongo + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
