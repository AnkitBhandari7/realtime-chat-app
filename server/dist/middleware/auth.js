import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer "))
            return res.status(401).json({ message: "Missing token" });
        const token = header.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user)
            return res.status(401).json({ message: "Invalid token" });
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Admin only" });
    next();
}
