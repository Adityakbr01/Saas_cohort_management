// videoQueue.ts
import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: 3, // Retry failed Redis connections
  connectTimeout: 10000, // 10s timeout for Redis connection
};

export const videoQueue = new Queue("video-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential",
      delay: 1000, // Exponential backoff starting at 1s
    },
    removeOnComplete: 100, // Keep only the last 100 completed jobs
    removeOnFail: 1000, // Keep only the last 1000 failed jobs
  },
});