import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { progressRoutes } from "./routes/progress.js";

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// Register CORS for web UI development
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
});

// Register rate limiting (100 requests per minute per IP)
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Health check endpoint
fastify.get("/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "barbuilder-api",
  };
});

// Register progress bar routes
await fastify.register(progressRoutes);

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    availableEndpoints: [
      "/health",
      "/percentage/{value}",
      "/xofy/{current}/{total}",
      "/icon/{current}/{total}",
    ],
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });

    console.log(`
┌─────────────────────────────────────────────────────┐
│                                                     │
│   BarBuilder.dev API Server                          │
│   Running on: http://${host}:${port}                │
│                                                     │
│   Health check: http://${host}:${port}/health       │
│                                                     │
│   Ready to generate SVG progress bars!              │
│                                                     │
└─────────────────────────────────────────────────────┘
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

// Start the server
start();
