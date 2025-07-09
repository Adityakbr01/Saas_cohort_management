import { videoQueue } from "@/configs/bullmq";
import connectDB from "@/configs/db";

// queueJobs.ts
export const addVideoToQueue = async (buffer: Buffer, lessonData: any): Promise<string> => {

  await connectDB();

  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer: Input must be a Buffer");
  }
  if (!lessonData || typeof lessonData !== "object") {
    throw new Error("Invalid lessonData: Must be a non-empty object");
  }

  const job = await videoQueue.add(
  "processVideo",
  {
    buffer,
    lessonId: lessonData.lessonId, // ✅ required for DB update
    originalName: lessonData.originalName, // optional metadata
    isPremium: lessonData.isPremium ?? true, // optional
  },
  {
    priority: lessonData.isPremium ? 1 : 2,
    jobId: `video_${lessonData.lessonId}_${Date.now()}`,
  }
);
  console.log("Job added to queue:", job.id);

  if(!job.id){
    throw new Error("Failed to add job to queue");
  }

  return job.id;
};