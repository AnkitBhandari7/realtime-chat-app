import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";

/** Helper — create JWT token */
function signToken(id: number, role: string) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}


 // REGISTER
 
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // basic input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check for existing user
    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash the password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: "user", // ensure default role
    });

    // generate token
    const token = signToken(user.id, user.role);

    // strip password before sending response
    const userData = user.toJSON() as any;
    delete userData.password;

    res.status(201).json({ token, user: userData });
  } catch (err: any) {
    console.error("Register failed:", err);
    res
      .status(500)
      .json({ message: err.message || "Register failed (server error)" });
  }
}

 //LOGIN
 
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Missing username or password" });
    }

    // fetch user including password 
    const user = await User.scope(null).findOne({
      where: { username },
      attributes: ["id", "username", "email", "password", "role"],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare password hashes
    const ok = await bcrypt.compare(password, user.password!);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // token and response
    const token = signToken(user.id, user.role);
    const userData = user.toJSON() as any;
    delete userData.password;

    res.json({ token, user: userData });
  } catch (err: any) {
    console.error("Login failed:", err);
    res
      .status(500)
      .json({ message: err.message || "Login failed (server error)" });
  }
}