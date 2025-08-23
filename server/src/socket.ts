import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { Server as HTTPServer } from "http";
import Message from "./models/Message.js";
import User from "./models/User.js";

const onlineMap = new Map<string, number>(); // userId -> socket count

function bumpOnline(userId: string, delta: number) {
  const next = (onlineMap.get(userId) || 0) + delta;
  if (next <= 0) onlineMap.delete(userId); else onlineMap.set(userId, next);
  const total = Array.from(onlineMap.keys()).length;
  (globalThis as any).__onlineUsersCount = total;
  return total;
}

async function broadcastStats(io: Server) {
  const [totalMessages, totalUsers] = await Promise.all([
    Message.countDocuments(),
    User.countDocuments()
  ]);
  const onlineUsers = (globalThis as any).__onlineUsersCount || 0;
  io.emit("stats:update", { totalMessages, totalUsers, onlineUsers });
}

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token
        || (socket.handshake.headers.authorization?.split(" ")[1]);
      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const user = await User.findById(payload.id);
      if (!user) return next(new Error("Invalid user"));
      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", async (socket) => {
    const user = (socket as any).user;
    const onlineUsers = bumpOnline(user._id.toString(), +1);
    io.emit("user:join", { userId: user._id, username: user.username, onlineUsers });
    await broadcastStats(io);

    socket.on("chat:message", async (payload: { content: string }) => {
      if (!payload?.content?.trim()) return;
      const msg = await Message.create({ content: payload.content.trim(), sender: user._id });
      const populated = await msg.populate("sender", "username");
      io.emit("chat:message", {
        _id: populated._id,
        content: populated.content,
        createdAt: populated.createdAt,
        sender: { _id: user._id, username: user.username }
      });
      await broadcastStats(io);
    });

    socket.on("disconnect", async () => {
      const onlineUsersNow = bumpOnline(user._id.toString(), -1);
      io.emit("user:left", { userId: user._id, username: user.username, onlineUsers: onlineUsersNow });
      await broadcastStats(io);
    });
  });
}
