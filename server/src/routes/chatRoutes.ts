import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMessages, getStats, getPrivateMessages, sendMessage } from "../controllers/chatController";

const router = Router();

// Public endpoints
router.get("/messages", getMessages);
router.get("/stats", getStats);

// Private endpoints (requires auth)
router.get("/private/:userId", authenticate, getPrivateMessages);
router.post("/send", authenticate, sendMessage);


export default router;
