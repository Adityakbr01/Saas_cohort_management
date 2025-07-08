// video.worker.ts
import { Worker } from "bullmq";
import fsExtra from "fs-extra";
import path from "path";
import { tmpdir } from "os";
import dotenv from "dotenv";
import { saveBufferToTempFile } from "@/utils/saveTemp";
import { convertToHLS } from "@/services/ffmpeg.service";
import { uploadHLSFolder } from "@/services/bunny.hls";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
};

console.log("👷 Video worker started and waiting for jobs...");

new Worker(
  "video-processing",
  async (job) => {
    console.log(`📥 Processing job ${job.id}`);
    const { buffer, lessonData } = job.data;

    // Validate input
    if (!Buffer.isBuffer(buffer) && !Buffer.isBuffer(Buffer.from(buffer))) {
      throw new Error("Invalid buffer data");
    }
    const decodedBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer, "base64");
    console.log(`🎞 Buffer size: ${(decodedBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Generate unique paths
    const inputPath = saveBufferToTempFile(decodedBuffer, `${job.id}.mp4`);
    const outputDir = path.join(tmpdir(), `hls_${job.id}_${Date.now()}`);
    const cloudFolder = `lms/hls/${lessonData.id}_${Date.now()}`;

    try {
      console.log("⚙️ Converting to HLS...");
      await convertToHLS(inputPath, outputDir);

      console.log("☁️ Uploading to Bunny CDN...");
      const url = await uploadHLSFolder(outputDir, cloudFolder);
      console.log(`✅ Uploaded HLS URL: ${url}`);

      // TODO: Update lesson in DB with HLS URL
      return { url, lessonData };
    } catch (err) {
      console.error(`❌ Job ${job.id} failed:`, err);
      throw new Error(`Video processing failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      console.log("🧹 Cleaning up temporary files...");
      await Promise.all([
        fsExtra.remove(inputPath).catch((err) => console.warn(`Failed to remove ${inputPath}: ${err.message}`)),
        fsExtra.remove(outputDir).catch((err) => console.warn(`Failed to remove ${outputDir}: ${err.message}`)),
      ]);
    }
  },
  {
    connection,
    concurrency: 2, // Increased for better throughput
    limiter: {
      max: 5, // Max 5 jobs per minute
      duration: 60_000,
    },
  }
);