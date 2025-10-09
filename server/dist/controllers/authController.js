import bcrypt from "bcryptjs"; // bycrypjs is used for hashing the password
import jwt from "jsonwebtoken"; // jwt for authentication and authorization
import User from "../models/User.js";
function signToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: "All fields required" });
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing)
            return res.status(409).json({ message: "User already exists" });
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed });
        const token = signToken(user._id.toString(), user.role);
        res.status(201).json({ token, user });
    }
    catch (err) {
        res.status(500).json({ message: err.message || "Register failed" });
    }
}
export async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: "Missing username/password" });
        const user = await User.findOne({ username });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(user._id.toString(), user.role);
        res.json({ token, user });
    }
    catch (err) {
        res.status(500).json({ message: err.message || "Login failed" });
    }
}
