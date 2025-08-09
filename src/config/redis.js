import dotenv from "dotenv";
import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis"; // Keep this import if you need fallback

dotenv.config({ path: "./config.env" });

// Determine which Redis client to use based on environment
export let redis;
console.log("redis url" , process.env.REDIS_URL);
if (process.env.UPSTASH_REDIS === "true") {
  // Upstash Redis configuration
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    throw new Error("Upstash Redis requires REDIS_URL and REDIS_TOKEN environment variables");
  }

  redis = new UpstashRedis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });

  console.log("✅ Using Upstash Redis");
} else {
  // Local/ioredis configuration
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number.parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  });

  // Add event listeners for local Redis
  redis.on("connect", () => {
    console.log("✅ Local Redis connected successfully");
  });

  redis.on("error", (err) => {
    console.error("❌ Local Redis connection error:", err);
  });
}