import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create a Redis client instance
const redisClient = createClient({ url: redisUrl });

// Log connection events
redisClient.on("connect", () => {
    console.log(" Redis connected successfully");
});

redisClient.on("ready", () => {
    console.log(" Redis client is ready for operations");
});

redisClient.on("error", (err) => {
    console.error(" Redis connection error:", err);
});

redisClient.on("end", () => {
    console.log(" Redis connection closed");
});

// Function to connect Redis safely
export async function connectRedis() {
    try {
        await redisClient.connect();
        console.log(" Connected to Redis server");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
        process.exit(1);
    }
}

export default redisClient; 
