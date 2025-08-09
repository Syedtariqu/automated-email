import dotenv from "dotenv";
import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";

dotenv.config({ path: "./config.env" });

// Force Upstash Redis for production/deployment
export let redis;

// Debug logging
console.log("🔍 Redis Configuration:");
console.log("REDIS_URL:", process.env.REDIS_URL ? "✅ Set" : "❌ Missing");
console.log("REDIS_TOKEN:", process.env.REDIS_TOKEN ? "✅ Set" : "❌ Missing");
console.log("UPSTASH_REDIS:", process.env.UPSTASH_REDIS);

// Check if we're in production or have Upstash URL
const hasUpstashUrl = process.env.REDIS_URL && process.env.REDIS_URL.includes("upstash.io");
const useUpstash = process.env.UPSTASH_REDIS === "true" || hasUpstashUrl;

if (useUpstash) {
  // Upstash Redis configuration
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    console.error("❌ Missing Upstash Redis configuration!");
    console.error("Required: REDIS_URL and REDIS_TOKEN environment variables");
    throw new Error("Upstash Redis configuration missing");
  }

  redis = new UpstashRedis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });

  console.log("✅ Using Upstash Redis");
} else {
  // Local Redis configuration (development only)
  console.warn("⚠️ Using local Redis - not recommended for production");
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number.parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  });

  redis.on("connect", () => {
    console.log("✅ Local Redis connected successfully");
  });

  redis.on("error", (err) => {
    console.error("❌ Local Redis connection error:", err);
  });
}
