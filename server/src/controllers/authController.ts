// Import required packages and models
import { Request, Response } from "express";
import bcrypt from "bcryptjs";  // For password hashing
import jwt from "jsonwebtoken"; // For creating login tokens
import { Op } from "sequelize"; // For database OR conditions
import User from "../models/User";

// Helper function: Create a login token (JWT) for a user
function signToken(id: number, role: string) {
  const secret = process.env.JWT_SECRET; // Secret key from .env
  if (!secret) {
    throw new Error("JWT_SECRET not set in environment variables");
  }
  // Create token that expires in 7 days
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
}

// REGISTER: Create a new user account
export async function register(req: Request, res: Response) {
  try {
    // Get username, email, and password from request body
    let { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    // Clean up the input (remove spaces, make email lowercase)
    username = (username || "").trim();
    email = (email || "").trim().toLowerCase();
    password = (password || "").trim();

    // Check if all fields are filled
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if password is long enough (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if username or email already exists in database
    const existing = await User.unscoped().findOne({
      where: { [Op.or]: [{ username }, { email }] }, // Check both username OR email
    });

    if (existing) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    // Encrypt the password before saving (never store plain passwords!)
    const hashed = await bcrypt.hash(password, 10);

    // Create the new user in database
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: "user", // Default role is regular user
    });

    // Create a login token for the new user
    const token = signToken(user.id, user.role);

    // Remove password from response (security)
    const { password: _pw, ...safeUser } = user.get({ plain: true }) as any;

    // Send success response with token and user info
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: safeUser,
    });
  } catch (err: any) {
    // Log errors only in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", err.message);
    }

    // Handle duplicate username/email error
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    // Handle validation errors (e.g., invalid email format)
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid input data",
        errors: err.errors.map((e: any) => e.message),
      });
    }

    // Generic server error
    return res.status(500).json({
      message: err.message || "Register failed (server error)",
    });
  }
}

// LOGIN: Log in an existing user
export async function login(req: Request, res: Response) {
  try {
    // Get username and password from request
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    // Check if both fields are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Find user by username in database (including password field)
    const user = await User.unscoped().findOne({
      where: { username: username.trim() },
      attributes: ["id", "username", "email", "password", "role"],
    });

    // If user doesn't exist, send error
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get the hashed password from database
    const hashed = user.getDataValue("password") as string | null;
    if (!hashed) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, hashed);

    // If passwords don't match, send error
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create login token for the user
    const token = signToken(user.id, user.role);

    // Remove password from response
    const { password: _pw, ...safeUser } = user.get({ plain: true }) as any;

    // Send success response with token and user info
    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err: any) {
    // Log errors only in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", err.message);
    }

    return res.status(500).json({
      message: err.message || "Login failed (server error)",
    });
  }
}