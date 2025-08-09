# 📚 Daily XKCD Email Service

This project is an Express.js backend application designed to deliver daily XKCD comics directly to your subscribers' inboxes. It features an email subscription system, sends welcome emails with a random comic upon subscription, and schedules the latest XKCD comic to be sent to all subscribers every day at 5 PM.

## ✨ Features

-   📧 **Email Subscription**: Simple API endpoint for users to subscribe with their email.
-   🎉 **Welcome Email**: New subscribers receive an immediate welcome email, including a random XKCD comic.
-   📅 **Daily Comic Delivery**: Automatically fetches the latest XKCD comic and sends it to all subscribers daily at 5 PM (configurable timezone).
-   🚀 **Robust Job Queue**: Utilizes BullMQ with Redis for reliable, scalable, and fault-tolerant email job processing.
-   📊 **Subscriber Management**: Stores and retrieves subscriber emails using Redis.
-   🎯 **Manual Trigger**: An endpoint to manually trigger the daily comic email distribution for testing purposes.
-   🌐 **Static Frontend**: A simple HTML page to demonstrate the subscription process.

## 🛠️ Technologies Used

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **BullMQ**: A robust, Redis-backed queueing system for Node.js.
-   **@upstash/redis**: The official serverless Redis client for Upstash.
-   **Nodemailer**: Module for Node.js applications to allow easy email sending.
-   **Axios**: Promise-based HTTP client for making requests to the XKCD API.
-   **Dotenv**: Loads environment variables from a `.env` file.
-   **CORS**: Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

## 💡 Key Concepts & Definitions

-   **Upstash Redis**:
    Upstash Redis is a serverless Redis service that provides a fully managed, low-latency, and cost-effective Redis database. It's ideal for applications that need a reliable Redis instance without the overhead of managing servers, making it perfect for use with BullMQ in production environments. The `@upstash/redis` client is specifically designed to work seamlessly with Upstash's REST API.

-   **Docker**:
    Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight, standalone, executable packages of software that include everything needed to run an application: code, runtime, system tools, system libraries and settings. It's an excellent tool for running local development services like Redis without installing them directly on your machine.

-   **Redis Insight**:
    Redis Insight is a powerful, intuitive, and free graphical user interface (GUI) for Redis. It allows you to visualize, monitor, and interact with your Redis data, including the queues managed by BullMQ, making it easier to debug and understand your application's state. You can connect Redis Insight to your local Dockerized Redis instance or your Upstash Redis instance.

-   **BullMQ**:
    BullMQ is a robust, high-performance, Redis-backed queueing system for Node.js. It's designed to handle background jobs, ensuring that tasks like sending emails are processed reliably, even if your application restarts or encounters errors. It provides features like job retries, concurrency control, and repeatable jobs (for scheduling daily emails).

-   **XKCD Comics**:
    XKCD is a popular webcomic created by Randall Munroe. It covers a wide range of topics including romance, sarcasm, math, and language. This project fetches comics directly from the official XKCD API. You can explore more comics at [https://xkcd.com](https://xkcd.com).

## ⚙️ Setup & Installation

### Prerequisites

-   Node.js (v16 or higher recommended)
-   npm (Node Package Manager)
-   **Docker Desktop**: For running local Redis (optional, but recommended for local development).
-   **Redis Insight**: For visualizing Redis data (optional, but recommended for debugging).
-   An Upstash Redis database (free tier available) - *Required for cloud deployment*.

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/xkcd-email-service.git
cd xkcd-email-service
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Redis

You have two options for Redis: **Local Development (Docker)** or **Cloud Deployment (Upstash)**.

#### Option A: Local Redis with Docker (for Development)

1.  **Pull the Redis Docker Image**:
    \`\`\`bash
    docker pull redis/redis-stack-server:latest
    \`\`\`

2.  **Run a Redis Container**:
    \`\`\`bash
    docker run -d --name my-local-redis -p 6379:6379 redis/redis-stack-server:latest
    \`\`\`
    This command starts a Redis container named `my-local-redis` and maps port `6379` from the container to your local machine.

3.  **Connect with Redis Insight**:
    *   Download and install [Redis Insight](https://redis.com/redis-enterprise/redis-insight/).
    *   Open Redis Insight and connect to your local Redis instance:
        *   **Host**: `127.0.0.1`
        *   **Port**: `6379`
    *   You can now explore the `bull:emailQueue` and `bull:emailQueue:repeat` keys to see your jobs and queue data.

4.  **Update `config.env` for Local Development**:
    If you want to use this local Redis for development, ensure your `config.env` looks like this (comment out Upstash variables):
    \`\`\`env
    PORT=4002
    # UPSTASH_REDIS_REST_URL=https://<YOUR_UPSTASH_HOST>.upstash.io
    # UPSTASH_REDIS_REST_TOKEN=<YOUR_UPSTASH_REST_TOKEN>

    # Local Redis (for Docker)
    REDIS_URL=redis://localhost:6379
    REDIS_TOKEN= # Not needed for local Redis unless you set a password

    # Email configuration (for sending emails)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com # Your Gmail address
    EMAIL_PASS=your_app_password   # Generate an App Password for Gmail (not your regular password)
    EMAIL_FROM=your_email@gmail.com # The email address that will appear as the sender
    \`\`\`
    *Note: You'll need to adjust your `backend/src/config/redis.js` to use `new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN })` for local Docker setup, or `Redis.fromEnv()` for Upstash.*

#### Option B: Upstash Redis (for Cloud Deployment)

1.  **Create an Upstash Redis Database**:
    Go to [Upstash Console](https://console.upstash.com/) and create a new Redis database. Choose the "Global" region for lowest latency or a region closest to your deployment.

2.  **Get Connection Details**:
    Once your database is created, navigate to its details page. You will find the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

3.  **Update `config.env` for Cloud Deployment**:
    Ensure your `config.env` looks like this (comment out local Redis variables):
    \`\`\`env
    PORT=4002
    UPSTASH_REDIS_REST_URL=https://<YOUR_UPSTASH_HOST>.upstash.io
    UPSTASH_REDIS_REST_TOKEN=<YOUR_UPSTASH_REST_TOKEN>

    # REDIS_URL=redis://localhost:6379
    # REDIS_TOKEN=

    # Email configuration (for sending emails)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com # Your Gmail address
    EMAIL_PASS=your_app_password   # Generate an App Password for Gmail (not your regular password)
    EMAIL_FROM=your_email@gmail.com # The email address that will appear as the sender
    \`\`\`

    **Note on `EMAIL_PASS` for Gmail**: If you're using Gmail, you'll need to generate an "App password" instead of using your regular Gmail password. You can do this in your Google Account security settings.

### 4. Start the Application

\`\`\`bash
npm start
# Or for development with auto-restarts:
npm run dev
\`\`\`

The server will start on `http://localhost:4002`. You should see console messages indicating Redis client initialization and SMTP connection readiness, and that the daily email job is scheduled.

## 🚀 API Endpoints

-   **Frontend Access**: Open `http://localhost:4002` in your browser to access the static subscription page.

-   **Subscribe to Daily Comics**
    \`\`\`http
    POST /api/subscribe
    Content-Type: application/json

    {
      "email": "test@example.com"
    }
    \`\`\`

-   **Get All Subscribers**
    \`\`\`http
    GET /api/subscribers
    \`\`\`

-   **Unsubscribe**
    \`\`\`http
    DELETE /api/unsubscribe
    Content-Type: application/json

    {
      "email": "test@example.com"
    }
    \`\`\`

-   **Manually Trigger Daily Comic Email** (for testing the daily email job immediately)
    \`\`\`http
    POST /api/send-daily-comic
    \`\`\`

## ☁️ Deployment

This application can be deployed to various cloud platforms that support Node.js applications, such as Render, Railway, or a custom VPS (e.g., DigitalOcean Droplets, AWS EC2).

### General Deployment Steps:

1.  **Choose a Cloud Provider**: Select a platform like Render, Railway, or a VPS provider.
2.  **Configure Environment Variables**: On your chosen platform, you will need to set the environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`) that your application uses. These are crucial for connecting to Upstash Redis and sending emails.
3.  **Build and Run**: Follow your platform's specific instructions to deploy a Node.js application. This usually involves connecting your Git repository and configuring a build command (`npm install`) and a start command (`npm start`).
4.  **Update Frontend URL**: Once your backend is deployed and has a public URL (e.g., `https://your-app.render.com`), you will need to update the `fetch` URL in your `backend/public/index.html` to point to this new backend URL. If your frontend is served from the same domain as your backend (which is common for Express apps serving static files), you can continue to use relative paths like `/api/subscribe`.

---

If you find this project useful, please consider giving it a star ⭐ on GitHub! Your support is greatly appreciated.
