import Message from "../models/Message.js";
import User from "../models/User.js";
export async function getMessages(req, res) {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const msgs = await Message.find().sort({ createdAt: -1 }).limit(limit).populate("sender", "username");
    res.json(msgs.reverse());
}
export async function getStats(_req, res) {
    const [totalMessages, totalUsers] = await Promise.all([
        Message.countDocuments(),
        User.countDocuments()
    ]);
    const onlineUsers = globalThis.__onlineUsersCount ?? 0;
    res.json({ totalMessages, totalUsers, onlineUsers });
}
