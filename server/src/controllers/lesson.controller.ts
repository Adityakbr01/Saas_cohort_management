// import { addVideoToQueue } from "@/jobs/queues/video.queue";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { videoQueue } from "../configs/bullmq";



// queueJobs.ts
export const addVideoToQueue = async (buffer: Buffer, lessonData: any): Promise<string> => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer: Input must be a Buffer");
  }
  if (!lessonData || typeof lessonData !== "object") {
    throw new Error("Invalid lessonData: Must be a non-empty object");
  }

  const job = await videoQueue.add(
    "processVideo",
    { buffer, lessonData },
    {
      priority: lessonData.isPremium ? 1 : 2, // Prioritize premium content
      jobId: `video_${lessonData.id}_${Date.now()}`, // Unique job ID
    }
  );
  console.log("Job added to queue:", job.id);

  if(!job.id){
    throw new Error("Failed to add job to queue");
  }

  return job.id;
};

import { z } from "zod"; // Assuming createLessonSchema uses Zod

// Validation schema for lesson data
const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  // Add other fields as needed
});

export const LessonController = {
  createLessonUnderChapter: expressAsyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    // const validatedData = createLessonSchema.parse(req.body);

    const lessonData = {
  chapterId: req.params.chapterId,
  title: "Intro to Node.js",
  description: "This is a fake lesson used for testing the video processing pipeline.",
  duration: "00:15:00", // optional
  createdBy: "64c1ef9b1234567890abcd12", // fake user ID
  tags: ["backend", "node", "api"],
  contentType: "video", // or "text" or "interactive"
  isPremium: false, // optional
  position: 1, // optional
  id: "64c1ef9b1234567890abcd12", // fake lesson ID
};


//     // // Prepare lesson data
//     // const lessonData = {
//     //   chapterId: req.params.chapterId,
//     //   ...validatedData,
//     // };

//     // Validate chapterId format (MongoDB ObjectId)
//     if (!req.params.chapterId.match(/^[0-9a-fA-F]{24}$/)) {
//       res.status(400).json({ error: "Invalid chapterId" });
//       return;
    // }

    // Check for video file
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: "Video file required" });
      return;
    }

    // Validate file size (max 1GB for 15-30 min 720p video)
    const maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB
    if (req.file.size > maxFileSize) {
      res.status(400).json({ error: "Video file too large. Max size: 1GB" });
      return;
    }

    try {
      // Add video to queue
      const jobId = await addVideoToQueue(req.file.buffer, lessonData);

      res.status(202).json({
        msg: "Video is being processed. It will be available soon.",
        jobId,
      });
    } catch (error) {
      res.status(500).json({
        error: `Failed to queue video: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }),
};
























;



















