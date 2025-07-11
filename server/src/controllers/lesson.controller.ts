import { Chapter } from "@/models/chapter.model";
import { Cohort } from "@/models/cohort.model";
import { Lesson } from "@/models/lesson.model";
import { uploadVideo } from "@/services/cloudinaryService";
import { ApiError } from "@/utils/apiError";
import getVideoDurationFromBuffer from "@/utils/getVideoDuration";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { Request, Response } from "express";
import { Types } from "mongoose";


type PopulatedCohort = {
  _id: Types.ObjectId;
  mentor: Types.ObjectId;
};



export const LessonController = {
  createLessonUnderChapter: wrapAsync(async (req: Request, res: Response) => {
    const lessonData = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const chapterId = req.params.chapterId;
    if (!chapterId) throw new ApiError(400, "Chapter ID is required");

   const chapter = await Chapter.findById(chapterId)
  .populate<{ cohort: PopulatedCohort }>("cohort");
   if (!chapter) throw new ApiError(404, "Chapter not found");
if (!chapter.cohort) throw new ApiError(400, "Chapter is not linked with any cohort");

  if (chapter.cohort.mentor.toString() !== userId) {
  throw new ApiError(403, "You are not authorized to add a lesson to this chapter");
}

    const existingLesson = await Lesson.findOne({ chapter: chapterId, title: lessonData.title });
    if (existingLesson) throw new ApiError(409, "Lesson title already exists in this chapter");

    // 🛡️ Get position with retry logic in case of duplicate
    let position = await Lesson.getNextPosition(chapter._id);
    let newLesson;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        newLesson = await Lesson.create({
          title: lessonData.title,
          shortDescription: lessonData.shortDescription,
          duration: 0,
          chapter: chapterId,
          isPrivate: lessonData.isPrivate ?? false,
          status: lessonData.status ?? "upcoming",
          contentType: lessonData.contentType,
          position,
        });

        break; // success
      } catch (err: any) {
        if (err.code === 11000 && err.keyPattern?.position) {
          position += 1; // increment and try again
        } else {
          throw err;
        }
      }
    }

    if (!newLesson) {
      throw new ApiError(500, "Failed to create lesson due to position conflict");
    }

    chapter.lessons.push(newLesson._id);
    await chapter.save();

    if (lessonData.contentType !== "video") {
      sendSuccess(res, 201, "Lesson created successfully", newLesson);
      return
    }

    // ✅ Validate Video
    if (!req.file || !req.file.buffer) throw new ApiError(400, "Video file is required");
    if (!req.file.mimetype.startsWith("video/")) {
      throw new ApiError(400, "Invalid file type. Only video files allowed");
    }

    const maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB
    if (req.file.size > maxFileSize) {
      throw new ApiError(400, "Video file too large. Max size: 1GB");
    }

    // 📤 Upload to Cloudinary or CDN
    const cloudinaryResponse = await uploadVideo(req.file);
    const durationInSeconds = await getVideoDurationFromBuffer(req.file.buffer);

    const hlsUrl = cloudinaryResponse.secure_url.replace(/\.mp4$/, ".m3u8");

    newLesson.videoUrl = hlsUrl;
    newLesson.duration = Math.floor(durationInSeconds);
    await newLesson.save();

    sendSuccess(res, 201, "Video lesson created successfully", newLesson);
  }),
  updateLesson: wrapAsync(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const updates = req.body;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new ApiError(404, "Lesson not found");
      }

      const chapter = await Chapter.findById(lesson.chapter);
      if (!chapter) {
        throw new ApiError(404, "Chapter not found");
      }

      const cohort = await Cohort.findById(chapter.cohort);
      if (!cohort) {
        throw new ApiError(404, "Cohort not found");
      }

      if (!cohort.mentor) {
        throw new ApiError(404, "Mentor not found");
      }

      if (cohort.mentor.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to update this lesson");
      }

      const updated = await Lesson.findByIdAndUpdate(lessonId, updates, { new: true });
      if (!updated) {
        throw new ApiError(500, "Failed to update lesson");
      }
      sendSuccess(res, 200, "Lesson updated successfully", updated);
    } catch (error) {
      console.error("Lesson update failed:", error);
      res.status(500).json({
        error: `Failed to update lesson: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }),
  deleteLesson: wrapAsync(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new ApiError(404, "Lesson not found");
      }

      const chapter = await Chapter.findById(lesson.chapter);
      if (!chapter) {
        throw new ApiError(404, "Chapter not found");
      }

      const cohort = await Cohort.findById(chapter.cohort);
      if (!cohort) {
        throw new ApiError(404, "Cohort not found");
      }

      if (!cohort.mentor) {
        throw new ApiError(404, "Mentor not found");
      }

      if (cohort.mentor.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to delete this lesson");
      }

      await Lesson.findByIdAndUpdate(lessonId, { isDeleted: true });

      chapter.lessons = chapter.lessons.filter(id => id.toString() !== lessonId);
      await chapter.save();

      // ✅ Update chapter status after deletion
      const remainingLessons = await Lesson.find({ chapter: chapter._id, isDeleted: false });

      const hasInProgress = remainingLessons.some(l => l.status === "inProgress");
      const allCompleted = remainingLessons.every(l => l.status === "completed");

      let newStatus: "upcoming" | "inProgress" | "completed" = "upcoming";
      if (hasInProgress) newStatus = "inProgress";
      if (allCompleted && remainingLessons.length > 0) newStatus = "completed";

      await Chapter.findByIdAndUpdate(chapter._id, { status: newStatus });

      sendSuccess(res, 200, "Lesson deleted successfully");
    } catch (error) {
      console.error("Lesson deletion failed:", error);
      res.status(500).json({
        error: `Failed to delete lesson: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }),
};
























;



















