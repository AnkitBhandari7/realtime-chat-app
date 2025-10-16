import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, sequelize } from "./config/db.js";
import { initSocket } from "./socket.js";

dotenv.config();
const port = Number(process.env.PORT) || 5001;

(async () => {
  try {
    console.log(" Connecting to database...");
    await connectDB();
    console.log("Database connected");

    //  FIXED: Use force: false, alter: false in development
    // Only use { force: true } when you want to drop and recreate tables
    await sequelize.sync({ force: false, alter: false });
    console.log("Models synchronized safely");

    const server = http.createServer(app);
    initSocket(server);

    await new Promise<void>((resolve) =>
      server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`API Base URL: http://localhost:${port}/api`);
        console.log(`Health Check: http://localhost:${port}/health`);
        resolve();
      })
    );

    console.log("Socket.io initialized and server running");
  } catch (err) {
    console.error("DB connection or server init failed:", err);
    process.exit(1);
  }
})();