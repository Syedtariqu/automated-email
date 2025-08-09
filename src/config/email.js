import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config({ path: "./config.env" })

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Test connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error)
  } else {
    console.log("✅ SMTP Connection Ready")
  }
})

// Store subscribers in Redis instead of memory
export const subscribedUsers = new Set()
