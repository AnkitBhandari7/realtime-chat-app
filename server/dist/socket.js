//Socket.IO setup for public and private chat
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import User from "./models/User.js";


// Global maps to track connections
const onlineMap = new Map();   // userId -> connection count
const userSockets = new Map(); // userId -> socket.id

// Utility: increment / decrement online user counts
function bumpOnline(userId, delta) {
    const next = (onlineMap.get(userId) || 0) + delta;
    if (next <= 0) onlineMap.delete(userId);
    else onlineMap.set(userId, next);
    const total = onlineMap.size;
    globalThis.__onlineUsersCount = total;
    return total;
}


// Broadcast overall stats to everyone

async function broadcastStats(io) {
    const [totalMessages, totalUsers] = await Promise.all([
        Message.count(),
        User.count(),
    ]);
    const onlineUsers = globalThis.__onlineUsersCount || 0;
    io.emit("stats:update", { totalMessages, totalUsers, onlineUsers });
}


// Main initializer — called from index.ts

export function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        },
    });

    //  Auth middleware 
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers.authorization?.split(" ")[1];
            if (!token) return next(new Error("No token"));

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(payload.id); // Sequelize lookup
            if (!user) return next(new Error("Invalid user"));

            socket.user = user; // attach user to the socket
            next();
        } catch (err) {
            next(new Error("Auth failed"));
        }
    });

    // On connection 
    io.on("connection", async (socket) => {
        const user = socket.user;

        // track which socket belongs to which userId
        userSockets.set(user.id, socket.id);

        const onlineUsers = bumpOnline(user.id, +1);
        io.emit("user:join", {
            userId: user.id,
            username: user.username,
            onlineUsers,
        });

        await broadcastStats(io);

        //  Handle public chat messages
       
        socket.on("chat:message", async (payload) => {
            if (!payload?.content?.trim()) return;

            // store message in DB
            const created = await Message.create({
                content: payload.content.trim(),
                senderId: user.id,
            });

            // send message to everyone
            io.emit("chat:message", {
                id: created.id,
                content: created.content,
                createdAt: created.createdAt,
                sender: { id: user.id, username: user.username },
            });

            await broadcastStats(io);
        });

        // Handle private chat messages
        
        socket.on("chat:private", async (payload) => {
            const { recipientId, content } = payload;
            if (!recipientId || !content?.trim()) return;

            // save private message to DB
            const created = await Message.create({
                content: content.trim(),
                senderId: user.id,
                recipientId, // store recipient for private chats
            });

            // build packet for sending
            const msgPacket = {
                id: created.id,
                content: created.content,
                createdAt: created.createdAt,
                sender: { id: user.id, username: user.username },
                recipientId,
            };

            //  Send only to target + sender
            const targetSocket = userSockets.get(recipientId);
            if (targetSocket) io.to(targetSocket).emit("chat:private", msgPacket);
            socket.emit("chat:private", msgPacket);
        });

        //  Handle disconnect
        socket.on("disconnect", async () => {
            userSockets.delete(user.id); // stop tracking this socket
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