import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // for local dev (Vite)
      "https://realtime-chat-il7zko648-ankit-bhandaris-projects-5cd522fa.vercel.app" // 
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.send("Realtime Chat App backend is running 🚀");
});

export default app;
