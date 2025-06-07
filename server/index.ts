import dotenv from "dotenv";
import http from "http";
import cluster from "cluster";
import os from "os";
import app from "@/server"; // Your Express app
import connectDB from "@/configs/db";
import { logger } from "./src/utils/logger";

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} is running`);
  logger.info(`Forking ${numCPUs} workers`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for dying workers and replace
  cluster.on("exit", (worker, code, signal) => {
    logger.error(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info("Starting a new worker...");
    cluster.fork();
  });
} else {
  // Worker processes
  const startServer = async () => {
    try {
      await connectDB(); // Connect to MongoDB

      const server = http.createServer(app);

      server.listen(PORT, () => {
        logger.info(`🚀 Worker ${process.pid} started server on port ${PORT}`);
      });

      // Handle uncaught exceptions and rejections in worker
      process.on("unhandledRejection", (reason) => {
        logger.error(`Unhandled Rejection: ${reason}`);
        process.exit(1);
      });

      process.on("uncaughtException", (err) => {
        logger.error(`Uncaught Exception: ${err.message}`);
        process.exit(1);
      });
    } catch (error) {
      logger.error("❌ Failed to start server");
      logger.error(error instanceof Error ? error.stack : String(error));
      process.exit(1);
    }
  };

  startServer();
}
