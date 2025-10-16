// src/routes/authRoutes.ts
import { Router } from "express";
import { register, login } from "../controllers/authController.js";

const router = Router();

// ✅ REMOVED: Detailed logging middleware

router.post("/register", register);
router.post("/login", login);

export default router;