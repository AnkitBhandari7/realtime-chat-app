import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { me, listUsers, getUser, updateUser, deleteUser, updateMe } from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticate, me);
router.put("/me", authenticate, updateMe);

router.get("/", authenticate, requireAdmin, listUsers);
router.get("/:id", authenticate, getUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
