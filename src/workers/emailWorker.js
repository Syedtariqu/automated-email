import { Worker } from "bullmq"
import { redis } from "../config/redis.js"
import { transporter } from "../config/email.js"
import { XKCDService } from "../services/xkcdService.js"

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { name, data } = job

    try {
      switch (name) {
        case "sendWelcomeEmail":
          await sendWelcomeEmail(data.email)
          break

        case "sendDailyComic":
          await sendDailyComicToAllSubscribers()
          break

        default:
          throw new Error(`Unknown job type: ${name}`)
      }
    } catch (error) {
      console.error(`❌ Job ${name} failed:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000, // 10 emails per minute
    },
  },
)

async function sendWelcomeEmail(email) {
  try {
    // Get a random comic for the welcome email
    const comic = await XKCDService.getRandomComic()

    const welcomeHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">🎉 Welcome to Daily XKCD!</h1>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #333; font-size: 16px;">Hi there!</p>
          <p style="color: #333; font-size: 16px;">
            Thank you for subscribing to our daily XKCD comic service! 
            You'll receive a fresh comic every day at 5 PM.
          </p>
          <p style="color: #333; font-size: 16px;">
            To get you started, here's a random comic from the XKCD archives:
          </p>
        </div>

        ${XKCDService.formatComicEmail(comic)}
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
          <p style="color: #666; margin: 0;">
            🕔 Daily comics arrive at 5 PM<br>
            📧 Delivered straight to your inbox<br>
            😄 Guaranteed to make you smile!
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🎉 Welcome to Daily XKCD Comics!",
      html: welcomeHtml,
    })

    console.log(`✅ Welcome email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error)
    throw error
  }
}

async function sendDailyComicToAllSubscribers() {
  try {
    // Get all subscribers from Redis
    const subscribers = await redis.smembers("subscribers")

    if (subscribers.length === 0) {
      console.log("📭 No subscribers found for daily comic")
      return
    }

    // Get today's comic (or latest)
    const comic = await XKCDService.getLatestComic()
    const comicHtml = XKCDService.formatComicEmail(comic)

    console.log(`📬 Sending daily comic #${comic.num} to ${subscribers.length} subscribers`)

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const emailPromises = batch.map(async (email) => {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `📚 Daily XKCD: ${comic.title}`,
            html: comicHtml,
          })
          console.log(`✅ Daily comic sent to ${email}`)
        } catch (error) {
          console.error(`❌ Failed to send daily comic to ${email}:`, error)
        }
      })

      await Promise.all(emailPromises)

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 Daily comic distribution completed for ${subscribers.length} subscribers`)
  } catch (error) {
    console.error("❌ Failed to send daily comics:", error)
    throw error
  }
}

// Worker event handlers
emailWorker.on("completed", (job) => {
  console.log(`✅ Worker completed job: ${job.name} (${job.id})`)
})

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Worker failed job: ${job.name} (${job.id})`, err.message)
})

emailWorker.on("error", (err) => {
  console.error("❌ Worker error:", err)
})

console.log("👷 Email worker started and ready")

export default emailWorker
