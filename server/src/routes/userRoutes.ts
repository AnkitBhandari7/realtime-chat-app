import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
    me,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
} from "../controllers/userController.js";
import User from "../models/User.js";

const router = Router();

// -----------------------------------------------------------
// 🚀 Public “user list” for chat sidebar
//    Returns only id & username for all users (no password/email)
// -----------------------------------------------------------
router.get("/", authenticate, async (_req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username"],
            order: [["username", "ASC"]],
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// -----------------------------------------------------------
// Current user (“me”) endpoints
// -----------------------------------------------------------
router.get("/me", authenticate, me);
router.put("/me", authenticate, updateMe);

// -----------------------------------------------------------
// Admin‑only management endpoints
// -----------------------------------------------------------
router.get("/admin/all", authenticate, requireAdmin, listUsers);
router.get("/:id", authenticate, getUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;