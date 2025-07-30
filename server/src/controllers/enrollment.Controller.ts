// // controllers/enrollmentController.ts
import { CohortRating } from "@/models/cohortRating.model";
import { ApiError } from "@/utils/apiError";
import { sendSuccess } from "@/utils/responseUtil";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { CohortEnrollment } from "../models/CohortEnrollment";
import { Cohort } from "../models/cohort.model";
import { default as UserCohortProgress, default as userCohortProgress } from "../models/userCohortProgress";
import { logger } from "@/utils/logger";


export const enrollUserToCohort = async (req: Request, res: Response) => {
  try {
    const { userId, cohortId } = req.body;

    if (!userId || !cohortId) {
      throw new ApiError(400, "userId and cohortId Requires")
    }

    const existing = await CohortEnrollment.findOne({ user: userId, cohort: cohortId });
    if (existing) {
      throw new ApiError(400, "User already enrolled in this cohort.")
    }

    const enrollment = await CohortEnrollment.create({
      user: userId,
      cohort: cohortId,
    });


    sendSuccess(res, 200, "User enrolled successfully", enrollment);
  } catch (error) {
    throw new ApiError(500, "Enrollment failed")
  }
};
// Get all cohorts a user is enrolled in
export const getUserEnrolledCourses = async (req: Request, res: Response) => {
  try {
    // Use req.user.id from auth middleware
    const userId = req.user?.id || req.query.userId || req.body.userId;
    if (!userId) {
      throw new ApiError(400, "Missing userId")
    }
    const enrollments = await CohortEnrollment.find({ user: userId })
      .populate({
        path: "cohort",
        select: "_id title shortDescription Thumbnail status startDate endDate mentor organization price originalPrice discount category difficulty rating language",
      });
    const courses = enrollments
      .filter((enr) => typeof enr.cohort === "object" && enr.cohort && "title" in enr.cohort)
      .map((enr) => {
        const cohort: any = enr.cohort;
        return {
          cohortId: cohort._id,
          name: cohort.title,
          shortDescription: cohort.shortDescription,
          thumbnail: cohort.Thumbnail,
          status: cohort.status,
          startDate: cohort.startDate,
          endDate: cohort.endDate,
          mentor: cohort.mentor,
          organization: cohort.organization,
          price: cohort.price,
          originalPrice: cohort.originalPrice,
          discount: cohort.discount,
          category: cohort.category,
          difficulty: cohort.difficulty,
          rating: cohort.rating,
          language: cohort.language,
        };
      });
    sendSuccess(res, 200, "", courses)
  } catch (error) {
    throw new ApiError(500, "Failed to fetch enrolled courses");
  }
};
// Get full cohort detail for a given cohortId
export const getCohortDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      logger.error("[getCohortDetail] req.user is missing. Auth middleware may have failed.");
      throw new ApiError(401, "Unauthorized: user not found in request")
    }
    const userId = req.user.id;

    const cohort = await Cohort.findById(id)
      .populate({
        path: "mentor",
        select: "_id name avatar bio profileImageUrl",
      })
      .populate({
        path: "chapters",
        populate: {
          path: "lessons",
          populate: [
            { path: "codeExamples" },
            { path: "resources" },
          ],
        },
      });

    if (!cohort) {
      throw new ApiError(404, "Cohort not found")
    }

    const userProgress = await UserCohortProgress.findOne({ user: userId, cohort: id });
    const completedLessonIds = userProgress?.completedLessons?.map((l: any) => l.lessonId.toString()) || [];

    let totalLessons = 0;
    let totalByType: Record<string, number> = { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 };
    if (cohort.chapters) {
      for (const chapter of cohort.chapters as any[]) {
        if (chapter.lessons) {
          totalLessons += chapter.lessons.length;
          for (const lesson of chapter.lessons) {
            const type = lesson.contentType || "video";
            if (totalByType[type] !== undefined) totalByType[type]++;
          }
        }
      }
    }

    let completedByType: Record<string, number> = { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 };
    if (userProgress && userProgress.completedLessons) {
      for (const l of userProgress.completedLessons) {
        if (!l.lessonId) continue;
        const lesson = cohort.chapters
          .flatMap((c: any) => c.lessons)
          .find((lsn: any) => lsn._id && l.lessonId && lsn._id.toString() === l.lessonId.toString());
        const type = lesson?.contentType || "video";
        if (completedByType[type] !== undefined) completedByType[type]++;
      }
    }

    const byTypePercent: Record<string, number> = {};
    for (const type of Object.keys(totalByType)) {
      byTypePercent[type] = totalByType[type] > 0 ? Math.round((completedByType[type] / totalByType[type]) * 100) : 0;
    }

    const progressData = userProgress
      ? {
        overall: totalLessons > 0 ? userProgress.completedLessons.length / totalLessons : 0,
        byType: byTypePercent,
        completedLessons: userProgress.completedLessons.length,
        totalLessons,
        timeSpent: userProgress.timeSpentSeconds
          ? `${Math.floor(userProgress.timeSpentSeconds / 3600)}h ${Math.floor(
            (userProgress.timeSpentSeconds % 3600) / 60
          )}m`
          : "0h 0m",
        streakDays: userProgress.streakDays,
        achievements: userProgress.achievements,
        xp: userProgress.xp,
        streak: userProgress.streak,
      }
      : {
        overall: 0,
        byType: byTypePercent,
        completedLessons: 0,
        totalLessons,
        timeSpent: "0h 0m",
        streakDays: [],
        achievements: [],
        xp: 0,
        streak: "",
      };

    let instructor = { id: "", name: "", avatar: "", bio: "" };
    if (cohort.mentor && typeof cohort.mentor === "object" && "name" in cohort.mentor) {
      const mentor: any = cohort.mentor;
      instructor = {
        id: mentor._id,
        name: mentor.name,
        avatar: mentor.avatar || mentor.profileImageUrl || "",
        bio: mentor.bio || "",
      };
    } else if (cohort.mentor) {
      instructor = { id: cohort.mentor.toString(), name: "", avatar: "", bio: "" };
    }

    const chapters = (cohort.chapters || []).map((chapter: any) => {
      const lessonList = chapter.lessons || [];

      const isChapterCompleted = lessonList.length > 0
        ? lessonList.every((lesson: any) => completedLessonIds.includes(lesson._id.toString()))
        : false;

      return {
        id: chapter._id,
        title: chapter.title,
        description: chapter.description,
        estimatedTime: chapter.estimatedTime || "",
        lessons: lessonList.map((lesson: any) => ({
          id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          shortDescription: lesson.shortDescription,
          type: lesson.contentType,
          duration: lesson.duration || "",
          isCompleted: completedLessonIds.includes(lesson._id.toString()),
          isBookmarked: lesson.isBookmarked || false,
          isLocked: lesson.isLocked || false,
          dueDate: lesson.dueDate,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          transcript: lesson.transcript,
          instructions: lesson.instructions,
          questions: lesson.questions,
          codeExamples: (lesson.codeExamples || []).map((code: any) => ({
            id: code._id,
            title: code.title,
            language: code.language,
            code: code.code,
            description: code.description,
            isStarter: code.isStarter,
            isSolution: code.isSolution,
            version: code.version,
            runLink: code.runLink,
            level: code.level,
          })),
          resources: (lesson.resources || []).map((resource: any) => ({
            id: resource._id,
            title: resource.title,
            type: resource.type,
            url: resource.url,
            size: resource.size,
            description: resource.description,
          })),
        })),
        isCompleted: isChapterCompleted,
        isBookmarked: chapter.isBookmarked || false,
        progress: chapter.progress || 0,
      };
    });

    const ratings = await CohortRating.find({ cohortId: id }).populate("userId", "name email profileImageUrl");

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings)
      : 0;

    const ratingsDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const r of ratings) {
      const key = r.rating.toString();
      if (ratingsDistribution[key] !== undefined) ratingsDistribution[key]++;
    }

    const enrichedRatings = ratings.map((r) => ({
      _id: r._id,
      rating: r.rating,
      createdAt: r.createdAt,

    }));

    const cohortData = {
      id: cohort._id,
      title: cohort.title,
      description: cohort.description,
      shortDescription: cohort.shortDescription,
      instructor,
      progress: progressData,
      chapters,
      students: cohort.students.length,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      status: cohort.status,
      organization: cohort.organization,
      mentor: cohort.mentor,
      createdBy: cohort.createdBy,
      schedule: cohort.schedule,
      location: cohort.location,
      completionRate: cohort.completionRate,
      language: cohort.language,
      tags: cohort.tags,
      prerequisites: cohort.prerequisites,
      ratingStats: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings,
        ratingsDistribution,
        ratings: enrichedRatings,
      },
    };

    sendSuccess(res, 200, "Cohort detail fetched", cohortData);
    return;
  } catch (error) {
    const err = error as Error;
    logger.error("[getCohortDetail] Error:", err.stack || err);
    throw new ApiError(500, "Failed to fetch cohort detail");
  }
};
export const LessonDurationUpdate = async (req: Request, res: Response) => {
  try {
    const { lessonId, cohortId, timeWatched = 0, increment = 5 } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (
      !lessonId ||
      !cohortId ||
      !mongoose.Types.ObjectId.isValid(lessonId) ||
      !mongoose.Types.ObjectId.isValid(cohortId) ||
      typeof timeWatched !== "number" ||
      typeof increment !== "number"
    ) {
      throw new ApiError(400, "Invalid input fields");
    }

    const progress = await UserCohortProgress.findOne({ user: userId, cohort: cohortId });

    if (!progress) {
      throw new ApiError(404, "Progress not found");
    }

    const lessonProgress = progress.completedLessons.find(
      (item) => item?.lessonId?.toString() === lessonId
    );

    if (lessonProgress) {
      // Update lastWatchedTime only if timeWatched moved forward
      if (timeWatched > (lessonProgress.lastWatchedTime || 0)) {
        lessonProgress.lastWatchedTime = timeWatched;
      }

      lessonProgress.timeSpent = (lessonProgress.timeSpent || 0) + increment;
    } else {
      // First-time watching this lesson, add entry
      progress.completedLessons.push({
        lessonId,
        lastWatchedTime: timeWatched,
        timeSpent: increment,
        completedAt: null, // Not yet completed
      });
    }

    progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + increment;
    progress.lastUpdated = new Date();

    await progress.save();

    res.json({ success: true });
    sendSuccess(res, 200, "updated lesson duration", true)
  } catch (error) {
    logger.error("[LessonDurationUpdate] Error:", error);
    throw new ApiError(500, "Failed to update lesson duration");
  }
};
export const getProgress = async (req: Request, res: Response) => {
  const { lessonId, cohortId } = req.query;

  if (!lessonId || !cohortId) {
    throw new ApiError(400, "Missing lessonId or cohortId")
  }

  try {
    const userId = req.user.id;

    const progress = await UserCohortProgress.findOne({
      user: userId,
      cohort: cohortId,
    });

    if (!progress) {
      res.json({ lastWatchedTime: 0 });
      return
    }

    const lessonProgress = progress.completedLessons.find(
      (l) => l?.lessonId?.toString() === lessonId
    );


    const lastWatchedTime = lessonProgress?.lastWatchedTime || 0;

    res.json({ lastWatchedTime });
  } catch (error) {
    logger.error('Error fetching progress:', error);
    throw new ApiError(500, "Server error")
  }
};
export const saveLessonProgress = async (req: Request, res: Response) => {
  const { lessonId, time, cohortId } = req.body;

  logger.info("Saving progress for lesson:", lessonId, "time:", time, "cohortId:", cohortId);

  if (!lessonId || time == null || !cohortId) {
    throw new ApiError(400, "Missing lessonId, time, or cohortId");
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(lessonId) || !mongoose.Types.ObjectId.isValid(cohortId)) {
    throw new ApiError(400, "Invalid lessonId or cohortId")
  }

  try {
    const userId = req.user.id;

    let progress = await userCohortProgress.findOne({ user: userId, cohort: cohortId });

    if (!progress) {
      // Create new progress doc
      progress = new userCohortProgress({
        user: userId,
        cohort: cohortId,
        completedLessons: [{
          lessonId,
          lastWatchedTime: time,
          timeSpent: time,
          completedAt: null, // Not yet completed unless confirmed
        }],
        timeSpentSeconds: time,
        streakDays: [],
        achievements: [],
        xp: 0,
        byType: { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 },
        lastCompletedAt: null,
      });
    } else {
      // Update existing progress
      const lessonProgress = progress.completedLessons.find((l) => l?.lessonId?.toString() === lessonId);

      if (lessonProgress) {
        // Only update if time increased
        if (time > (lessonProgress.lastWatchedTime || 0)) {
          const timeIncrement = time - (lessonProgress.lastWatchedTime || 0);

          lessonProgress.lastWatchedTime = time;
          lessonProgress.timeSpent = (lessonProgress.timeSpent || 0) + timeIncrement;
          progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + timeIncrement;
        }

        // Optionally update completedAt (if video is fully watched)
        lessonProgress.completedAt = new Date(); // Uncomment if needed
      } else {
        // Add new lesson entry
        progress.completedLessons.push({
          lessonId,
          lastWatchedTime: time,
          timeSpent: time,
          completedAt: null,
        });

        progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + time;
      }
    }

    progress.lastUpdated = new Date();
    await progress.save();
    sendSuccess(res, 200, "Progress saved successfully", progress);

  } catch (error) {
    logger.error("Error saving progress:", error);
    throw new ApiError(500, "Failed to save progress");
  }
};
export const getLessonProgress = async (req: Request, res: Response) => {
  const { lessonId, cohortId } = req.query;
  const userId = req.user.id; // From auth middleware
  if (!lessonId || !cohortId) {
    throw new ApiError(400, "Missing lessonId or cohortId")
  }
  if (typeof lessonId !== "string" || typeof cohortId !== "string") {
    res.status(400).json({ message: "Invalid lessonId or cohortId format" });
    throw new ApiError(400, "Invalid lessonId or cohortId format")
  }
  const progress = await UserCohortProgress.findOne({ user: userId, cohort: cohortId });
  if (!progress) {
    throw new ApiError(404, "Progress not found")
  }
  if (!progress.completedLessons || !Array.isArray(progress.completedLessons)) {
    throw new ApiError(404, "No lessons found for this user in this cohort")
  }
  const lessonProgress = progress.completedLessons.find(
    (item) => item?.lessonId?.toString() === lessonId
  );

  if (!lessonProgress) {
    throw new ApiError(404, "Lesson progress not found")
  }
  res.json({ lastWatchedTime: lessonProgress.lastWatchedTime || 8 });
};