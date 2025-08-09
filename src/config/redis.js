// import Redis from "ioredis"
import dotenv from "dotenv"
import { Redis as UpstashRedis } from "@upstash/redis";

dotenv.config({ path: "./config.env" })

// export const redis = new Redis({
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number.parseInt(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryDelayOnFailover: 100,
//   lazyConnect: true,
// })

// redis.on("connect", () => {
//   console.log("✅ Redis connected successfully")
// })

export let redis = new UpstashRedis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });
//    redis.on("connect", () => {
//     console.log("✅ Local Redis connected successfully");
//   });
// redis.on("error", (err) => {
//   console.error("❌ Redis connection error:", err)
// })
