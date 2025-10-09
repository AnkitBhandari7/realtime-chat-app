import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getMessages, getStats } from "../controllers/chatController.js";
const router = Router();
router.get("/messages", authenticate, getMessages);
router.get("/stats", authenticate, getStats);
export default router;
