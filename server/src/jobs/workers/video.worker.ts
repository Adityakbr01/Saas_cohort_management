import { Worker } from "bullmq";
import fsExtra from "fs-extra";
import path from "path";
import { tmpdir } from "os";
import dotenv from "dotenv";
import { saveBufferToTempFile } from "@/utils/saveTemp";
import { convertToHLS } from "@/services/ffmpeg.service";
import { uploadHLSFolder } from "@/services/bunny.hls";
import connectDB from "@/configs/db";
import getVideoDuration from "@/utils/getVideoDuration";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
};

(async () => {
  await connectDB(); // ✅ Ensure MongoDB is connected before using models

  const { Lesson } = await import("@/models/lesson.model"); // 👈 Optional dynamic import (to ensure Mongoose is ready)

  console.log("👷 Video worker started and waiting for jobs...");

  new Worker(
    "video-processing",
    async (job) => {
      console.log(`📥 Processing job ${job.id}`);
      const { buffer, lessonId, originalName } = job.data;

      const decodedBuffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(buffer, "base64");
      console.log(`🎞 Buffer size: ${(decodedBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      const inputPath = saveBufferToTempFile(decodedBuffer, originalName || `${job.id}.mp4`);
      const outputDir = path.join(tmpdir(), `hls_${job.id}_${Date.now()}`);
      const cloudFolder = `lms/hls/${job.id}_${Date.now()}`;

      try {

        // ⏱ Step 1: Extract duration
        console.log("⏱ Calculating video duration...");
        const durationInSec = await getVideoDuration(inputPath);
        console.log(`✅ Duration: ${durationInSec.toFixed(2)} seconds`);

        await Lesson.findByIdAndUpdate(lessonId, {
          duration: Math.round(durationInSec),
        });

        console.log("⚙️ Converting to HLS...");
        await convertToHLS(inputPath, outputDir);

        console.log("☁️ Uploading to Bunny CDN...");
        const url = await uploadHLSFolder(outputDir, cloudFolder);
        console.log(`✅ Uploaded HLS URL: ${url}`);

        await Lesson.findByIdAndUpdate(lessonId, {
          videoUrl: url,
          duration: durationInSec,
        })
        console.log(`✅ Lesson ${lessonId} updated with video URL.`);

        return { url };
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
      concurrency: 2,
      limiter: {
        max: 5,
        duration: 60_000,
      },
    }
  );
})();
