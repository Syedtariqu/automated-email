import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import subscribeRoutes from "./src/routes/subscribe.js"
import "./src/workers/emailWorker.js"
import "./src/queues/emailQueue.js"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config({ path: "./config.env" })

const app = express()
const PORT = process.env.PORT || 4002

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api", subscribeRoutes)


app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "XKCD Email Service is running!" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})