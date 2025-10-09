import { Request, Response } from "express";
import { Op } from "sequelize";
import Message from "../models/Message.js";
import User from "../models/User.js";

// make global count available
declare global {
  var __onlineUsersCount: number | undefined;
}


 // GET /api/chat/messages  
 
export async function getMessages(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const msgs = await Message.findAll({
      where: { recipientId: null }, // only public messages
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
      order: [["createdAt", "DESC"]],
      limit,
    });

    res.json(msgs.reverse());
  } catch (err: any) {
    console.error("getMessages failed:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}


 // GET /api/chat/stats   — Counts for sidebar / header

export async function getStats(_req: Request, res: Response) {
  try {
    const [totalMessages, totalUsers] = await Promise.all([
      Message.count(),
      User.count(),
    ]);

    const onlineUsers = globalThis.__onlineUsersCount ?? 0;
    res.json({ totalMessages, totalUsers, onlineUsers });
  } catch (err: any) {
    console.error("getStats failed:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}


 //GET /api/chat/private/:userId
 //Return all conversation between logged‑in user and that userId
 
export async function getPrivateMessages(req: any, res: Response) {
  try {
    const currentUserId = req.user.id;            // added by authenticate middleware
    const otherUserId = Number(req.params.userId);

    const msgs = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
      order: [["createdAt", "ASC"]],
    });

    res.json(msgs);
  } catch (err: any) {
    console.error("getPrivateMessages failed:", err);
    res.status(500).json({ message: "Failed to fetch private messages" });
  }
}