import { createClient } from "redis";
const pub = createClient({ url: process.env.REDIS_URL });
const sub = createClient({ url: process.env.REDIS_URL });

pub.on("error", (err) => console.error("Redis pub error:", err));
sub.on("error", (err) => console.error("Redis sub error:", err));

export async function connectPubSub() {
    await pub.connect();
    await sub.connect();
}

export { pub, sub };