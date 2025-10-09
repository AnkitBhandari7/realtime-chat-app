import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, sequelize } from "./config/db.js";
import { initSocket } from "./socket.js";
dotenv.config();
const port = Number(process.env.PORT) || 5001;
const server = http.createServer(app);
initSocket(server);
connectDB()
    .then(async () => {
    // Ensure models are initialized and synced with the DB
    await sequelize.sync({ alter: true }); // updates tables safely
    console.log("Models synchronized");
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
})
    .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
});
// Routes (keep them here, after app is created)
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
