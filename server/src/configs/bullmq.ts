import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

export const videoQueue = new Queue("video-processing", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: 6379,
  },
});