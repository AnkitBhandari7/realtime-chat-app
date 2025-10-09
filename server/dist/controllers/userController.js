import User from "../models/User.js";
export async function me(req, res) {
    res.json(req.user);
}
export async function listUsers(_req, res) {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
}
export async function getUser(req, res) {
    const u = await User.findById(req.params.id);
    if (!u)
        return res.status(404).json({ message: "Not found" });
    if (req.user.role !== "admin" && req.user._id.toString() !== u._id.toString())
        return res.status(403).json({ message: "Forbidden" });
    res.json(u);
}
export async function updateUser(req, res) {
    const target = await User.findById(req.params.id);
    if (!target)
        return res.status(404).json({ message: "Not found" });
    const isSelf = req.user._id.toString() === target._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin)
        return res.status(403).json({ message: "Forbidden" });
    const { username, email, role } = req.body;
    if (username !== undefined)
        target.username = username;
    if (email !== undefined)
        target.email = email;
    if (role !== undefined && isAdmin)
        target.role = role;
    await target.save();
    res.json(target);
}
export async function deleteUser(req, res) {
    const target = await User.findById(req.params.id);
    if (!target)
        return res.status(404).json({ message: "Not found" });
    const isSelf = req.user._id.toString() === target._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin)
        return res.status(403).json({ message: "Forbidden" });
    await target.deleteOne();
    res.json({ ok: true });
}
export async function updateMe(req, res) {
    const { username, email } = req.body;
    if (username !== undefined)
        req.user.username = username;
    if (email !== undefined)
        req.user.email = email;
    await req.user.save();
    res.json(req.user);
}
