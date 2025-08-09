import { Queue } from "bullmq"
import { redis } from "../config/redis.js"

export const emailQueue = new Queue("emailQueue", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
  },
})

// Setup daily email job at 5 PM (17:00)
async function setupDailyEmailJob() {
  try {
    // Clean up existing repeatable jobs
    const repeatableJobs = await emailQueue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      if (job.name === "sendDailyComic") {
        await emailQueue.removeRepeatableByKey(job.key)
        console.log("🧹 Removed existing daily job")
      }
    }

    // Add new daily job at 5 PM
    await emailQueue.add(
      "sendDailyComic",
      {},
      {
        repeat: {
         pattern: "0 20 * * *", // 8 PM every day
          tz: "Asia/Kolkata", // Adjust timezone as needed
        },
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    )

    console.log("📅 Daily comic email scheduled for 8 PM")
  } catch (err) {
    console.error("❌ Failed to schedule daily emails:", err)
  }
}

// Event handlers
emailQueue.on("completed", (job) => {
  console.log(`✅ Email job ${job.name} completed: ${job.id}`)
})

emailQueue.on("failed", (job, err) => {
  console.error(`❌ Email job ${job.name} failed: ${job.id}`, err.message)
})

emailQueue.on("stalled", (jobId) => {
  console.warn(`⚠️ Job stalled: ${jobId}`)
})

// Initialize the daily job
setupDailyEmailJob()

console.log("📬 Email queue initialized")
