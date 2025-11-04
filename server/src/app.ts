import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redisClient";

// Import routes 
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();

// If behind a proxy (Render, Vercel, etc.), needed for secure cookies
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allowed origins
const allowList = new Set<string>([
  "http://localhost:5173",
  "https://realtime-chat-il7zko648-ankit-bhandaris-projects-5cd522fa.vercel.app",
]);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return allowList.has(origin) || url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS not allowed for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "chatapp:",
});

app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// SIMPLIFIED: Only log in development mode and only errors/important events
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    if (req.method === "POST") {
      console.log(`${req.method} ${req.originalUrl}`);
    }
    next();
  });
}

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Root route
app.get("/", (_req, res) =>
  res.send("Realtime Chat App backend is running 🚀")
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);

  if (err.message?.includes("CORS")) {
    return res.status(403).json({
      message: "CORS error",
      error: err.message,
    });
  }

  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
