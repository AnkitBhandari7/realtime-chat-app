// Import required packages and models
import { Request, Response } from "express";
import { Op } from "sequelize"; // For complex database queries
import Message from "../models/Message";
import User from "../models/User";

// Type for authenticated requests (requests from logged-in users)
type AuthedRequest = Request & {
  user?: { id: number; role: string; username?: string; email?: string };
};

// GET /api/chat/messages — Get recent public messages
export async function getMessages(req: Request, res: Response) {
  try {
    // Get limit from query parameter (default 50, max 200)
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    // Fetch public messages from database (recipientId is null)
    const msgs = await Message.findAll({
      where: { recipientId: null }, // Only public messages
      include: [
        { model: User, as: "sender", attributes: ["id", "username"] }, // Include sender info
      ],
      order: [["createdAt", "DESC"]], // Newest first
      limit,
    });

    // Reverse to show oldest first
    return res.json(msgs.reverse());
  } catch (err: any) {
    console.error("getMessages failed:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
}

// GET /api/chat/stats — Get statistics (total messages, users, online users)
export async function getStats(_req: Request, res: Response) {
  try {
    // Count total messages and users in database
    const [totalMessages, totalUsers] = await Promise.all([
      Message.count(),
      User.count(),
    ]);

    // Get online users count (stored in global variable by socket.io)
    const onlineUsers = (globalThis as any).__onlineUsersCount ?? 0;

    return res.json({ totalMessages, totalUsers, onlineUsers });
  } catch (err: any) {
    console.error("getStats failed:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

// GET /api/chat/private/:userId — Get private chat between current user and another user
export async function getPrivateMessages(req: AuthedRequest, res: Response) {
  try {
    // Check if user is logged in
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const currentUserId = req.user.id;
    const otherUserId = Number(req.params.userId);

    // Validate the other user's ID
    if (Number.isNaN(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Fetch messages between these two users (in both directions)
    const msgs = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, recipientId: otherUserId }, // Messages I sent to them
          { senderId: otherUserId, recipientId: currentUserId }, // Messages they sent to me
        ],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "username"] },
        { model: User, as: "recipient", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "ASC"]], // Oldest first
    });

    return res.json(msgs);
  } catch (err: any) {
    console.error("getPrivateMessages failed:", err);
    return res.status(500).json({ message: "Failed to fetch private messages" });
  }
}

// POST /api/chat/send — Send a new message (public or private)
export async function sendMessage(req: AuthedRequest, res: Response) {
  try {
    // Check if user is logged in
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Get message content and optional recipient ID
    const { content, recipientId } = req.body as {
      content?: string;
      recipientId?: number
    };

    // Check if message has content
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // Save message to database
    const message = await Message.create({
      content: content.trim(),
      senderId: req.user.id,
      recipientId: recipientId || null, // null = public message
    });

    // Fetch the complete message with sender and recipient info
    const msgWithUsers = await Message.findByPk(message.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "username"] },
        { model: User, as: "recipient", attributes: ["id", "username"] },
      ],
    });

    return res.status(201).json(msgWithUsers);
  } catch (err: any) {
    console.error("sendMessage failed:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
}