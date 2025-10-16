import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { Server as HTTPServer } from "http";
import Message from "./models/Message.js";
import User from "./models/User.js";

const onlineMap = new Map<number, number>();
const userSockets = new Map<number, string>();

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
      origin: [
        "http://localhost:5173",
        "https://realtime-chat-il7zko648-ankit-bhandaris-projects-5cd522fa.vercel.app",
      ],
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    },
    allowEIO3: true,
  });

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

  io.on("connection", async (socket) => {
    const user = (socket as any).user as User;

    //  REMOVED: console.log for connection

    userSockets.set(user.id, socket.id);

    const history = await Message.findAll({
      where: { recipientId: null },
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
      order: [["createdAt", "ASC"]],
      limit: 100,
    });

    socket.emit("chat:history", history);

    const onlineUsers = bumpOnline(user.id, +1);
    io.emit("user:join", {
      userId: user.id,
      username: user.username,
      onlineUsers,
    });
    await broadcastStats(io);

    // Public message
    socket.on("chat:message", async (payload: { content: string }) => {
      try {
        if (!payload?.content?.trim()) return;

        const created = await Message.create({
          content: payload.content.trim(),
          senderId: user.id,
          recipientId: null,
        });

        const msgPacket = {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt,
          senderId: user.id,
          sender: {
            id: user.id,
            username: user.username,
          },
          recipientId: null,
          recipient: null,
        };

        io.emit("chat:message", msgPacket);
        await broadcastStats(io);
      } catch (error) {
        //  Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Message error:", (error as Error).message);
        }
      }
    });

    // Private message
    socket.on("chat:private", async (payload: { recipientId: number; content: string }) => {
      try {
        const { recipientId, content } = payload;
        if (!recipientId || !content?.trim()) return;

        const created = await Message.create({
          content: content.trim(),
          senderId: user.id,
          recipientId,
        });

        const msgPacket = {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt,
          senderId: user.id,
          sender: {
            id: user.id,
            username: user.username,
          },
          recipientId: recipientId,
          recipient: {
            id: recipientId,
          },
        };

        const targetSocketId = userSockets.get(recipientId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("chat:private", msgPacket);
        }

        socket.emit("chat:private", msgPacket);
      } catch (error) {
        //Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Private message error:", (error as Error).message);
        }
      }
    });

    socket.on("disconnect", async () => {
      // REMOVED: console.log for disconnection

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

  return io;
}