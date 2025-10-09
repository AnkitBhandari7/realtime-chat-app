import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { Server as HTTPServer } from "http";
import Message from "./models/Message.js";
import User from "./models/User.js";

const onlineMap = new Map<number, number>();    // userId → socket-count
const userSockets = new Map<number, string>();  // userId → socket.id

function bumpOnline(userId: number, delta: number) {
  const next = (onlineMap.get(userId) || 0) + delta;
  if (next <= 0) onlineMap.delete(userId);
  else onlineMap.set(userId, next);
  const total = onlineMap.size;
  (globalThis as any).__onlineUsersCount = total;
  return total;
}

async function broadcastStats(io: Server) {
  const [totalMessages, totalUsers] = await Promise.all([
    Message.count(),
    User.count(),
  ]);
  io.emit("stats:update", {
    totalMessages,
    totalUsers,
    onlineUsers: (globalThis as any).__onlineUsersCount || 0,
  });
}

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  });

  // JWT authentication 
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        socket.handshake.headers.authorization?.split(" ")[1];
      if (!token) return next(new Error("No token"));

      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const user = await User.findByPk(payload.id);
      if (!user) return next(new Error("Invalid user"));

      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  // main connection 
  io.on("connection", async (socket) => {
    const user = (socket as any).user as User;
    userSockets.set(user.id, socket.id);

    // send message history (public only)
    const history = await Message.findAll({
      where: { recipientId: null },
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
      order: [["createdAt", "ASC"]],
    });
    socket.emit("chat:history", history);

    // mark online
    const onlineUsers = bumpOnline(user.id, +1);
    io.emit("user:join", {
      userId: user.id,
      username: user.username,
      onlineUsers,
    });
    await broadcastStats(io);

    // PUBLIC MESSAGES 
    socket.on("chat:message", async (payload: { content: string }) => {
      if (!payload?.content?.trim()) return;

      const created = await Message.create({
        content: payload.content.trim(),
        senderId: user.id,
        recipientId: null, // explicit public value
      });

      io.emit("chat:message", {
        id: created.id,
        content: created.content,
        createdAt: created.createdAt,
        sender: { id: user.id, username: user.username },
      });

      await broadcastStats(io);
    });

    // PRIVATE MESSAGES 
    socket.on(
      "chat:private",
      async (payload: { recipientId: number; content: string }) => {
        const { recipientId, content } = payload;
        if (!recipientId || !content?.trim()) return;

        //  Save in DB including recipientId
        const created = await Message.create({
          content: content.trim(),
          senderId: user.id,
          recipientId,
        });

        // build packet
        const msgPacket = {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt,
          sender: { id: user.id, username: user.username },
          recipientId,
        };

        //  Send to recipient (if online) and echo to sender
        const targetSocketId = userSockets.get(recipientId);
        if (targetSocketId) io.to(targetSocketId).emit("chat:private", msgPacket);
        socket.emit("chat:private", msgPacket);
      }
    );

    // DISCONNECT 
    socket.on("disconnect", async () => {
      userSockets.delete(user.id);
      const onlineUsersNow = bumpOnline(user.id, -1);
      io.emit("user:left", {
        userId: user.id,
        username: user.username,
        onlineUsers: onlineUsersNow,
      });
      await broadcastStats(io);
    });
  });
}