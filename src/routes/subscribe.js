import express from "express"
import { emailQueue } from "../queues/emailQueue.js"
import { subscribedUsers } from "../config/email.js"
import { redis } from "../config/redis.js"

const router = express.Router()

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    // Check if already subscribed
    const isSubscribed = await redis.sismember("subscribers", email)
    if (isSubscribed) {
      return res.status(409).json({ error: "Email already subscribed" })
    }

    // Add to Redis set
    await redis.sadd("subscribers", email)
    subscribedUsers.add(email)

    // Send welcome email immediately
    await emailQueue.add(
      "sendWelcomeEmail",
      { email },
      {
        priority: 10,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    )

    console.log(`✅ New subscriber: ${email}`)
    res.json({
      success: true,
      message: "Subscribed successfully! Welcome email sent.",
    })
  } catch (error) {
    console.error("Subscription error:", error)
    res.status(500).json({ error: "Failed to subscribe" })
  }
})

router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await redis.smembers("subscribers")
    res.json({
      count: subscribers.length,
      subscribers: subscribers,
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    res.status(500).json({ error: "Failed to fetch subscribers" })
  }
})

router.delete("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    await redis.srem("subscribers", email)
    subscribedUsers.delete(email)

    res.json({
      success: true,
      message: "Unsubscribed successfully",
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    res.status(500).json({ error: "Failed to unsubscribe" })
  }
})

// Manual trigger for testing
router.post("/send-daily-comic", async (req, res) => {
  try {
    await emailQueue.add(
      "sendDailyComic",
      {},
      {
        priority: 5,
        attempts: 3,
      },
    )

    res.json({
      success: true,
      message: "Daily comic email triggered manually",
    })
  } catch (error) {
    console.error("Manual trigger error:", error)
    res.status(500).json({ error: "Failed to trigger daily comic" })
  }
})

export default router
