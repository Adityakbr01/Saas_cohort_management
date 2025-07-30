import { Request, Response } from "express";
import UserCohortProgress from "../models/userCohortProgress";
import { Cohort } from "../models/cohort.model";
import { Lesson } from "../models/lesson.model";
import mongoose from "mongoose";
import { sendSuccess, sendError } from "@/utils/responseUtil";
import safeCache from "@/utils/cache";

function formatTimeSpent(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Always use authenticated user
    const { cohortId, chapterId, lessonId, timeSpent = 0 } = req.body;
    safeCache.del(userId)

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(cohortId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      sendError(res, 400, "Invalid ID format");
      return
    }
    if (!cohortId || !lessonId) {
      sendError(res, 400, "Missing required fields");
      return
    }

    // Find or create progress doc
    let progress = await UserCohortProgress.findOne({ user: userId, cohort: cohortId });
    if (!progress) {
      progress = new UserCohortProgress({
        user: userId,
        cohort: cohortId,
        completedLessons: [],
        timeSpentSeconds: 0,
        streakDays: [],
        achievements: [],
        xp: 0,
        byType: { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 },
        lastCompletedAt: null,
      });
    }

    // If lesson already completed, just return current progress
    if (progress.completedLessons.some((l: any) => l.lessonId.toString() === lessonId)) {
      sendSuccess(res, 200, "Lesson already completed", { progress });
      return
    }

    // Get lesson type
    const lesson = await Lesson.findById(lessonId);
    const lessonType = lesson?.contentType || "video";

    // Add lesson to completedLessons
    progress.completedLessons.push({ lessonId, completedAt: new Date(), timeSpent });
    progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + Number(timeSpent);
    // Ensure byType is always an object
    if (!progress.byType) progress.byType = { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 };
    progress.byType[lessonType] = (progress.byType[lessonType] || 0) + 1;

    // XP logic (e.g., 10xp per lesson)
    progress.xp = (progress.xp || 0) + 10;

    // Streak logic
    const today = new Date();
    let streakDays = progress.streakDays || [];
    if (streakDays.length === 0 || !isSameDay(new Date(streakDays[streakDays.length - 1]), today)) {
      streakDays.push(today);
    }
    // Remove duplicates and keep only unique days
    streakDays = Array.from(new Set(streakDays.map((d: Date | string) => new Date(d).toDateString()))).map((d: string) => new Date(d));
    progress.streakDays = streakDays;
    progress.lastCompletedAt = today;

    // Achievements (example: complete 5 lessons)
    if ((progress.completedLessons.length === 5) && !progress.achievements.includes("5 Lessons")) {
      progress.achievements.push("5 Lessons");
    }

    // Calculate progress
    const cohort = await Cohort.findById(cohortId).populate({ path: "chapters", populate: { path: "lessons" } });
    let totalLessons = 0;
    if (cohort && cohort.chapters) {
      for (const chapter of cohort.chapters as any[]) {
        totalLessons += (chapter.lessons ? chapter.lessons.length : 0);
      }
    }
    const completedLessons = progress.completedLessons.length;
    const overall = totalLessons > 0 ? completedLessons / totalLessons : 0;

    // Format time spent
    const timeSpentFormatted = formatTimeSpent(progress.timeSpentSeconds || 0);

    // Calculate current streak
    let streak = 1;
    if (progress.streakDays.length > 1) {
      streak = 1;
      for (let i = progress.streakDays.length - 1; i > 0; i--) {
        const prev = new Date(progress.streakDays[i - 1]);
        const curr = new Date(progress.streakDays[i]);
        if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    await progress.save();

    // Return updated progress
    sendSuccess(res, 200, "Progress updated", {
      progress: {
        overall,
        byType: progress.byType,
        completedLessons,
        totalLessons,
        timeSpent: timeSpentFormatted,
        streakDays: progress.streakDays,
        achievements: progress.achievements,
        xp: progress.xp,
        streak: `${streak} day${streak > 1 ? "s" : ""}`,
      },
    });
    return
  } catch (error) {
    // Log error with user and endpoint context
    console.error(`[Progress] Error for user ${req.user?.id}:`, error);
    sendError(res, 500, "Failed to update progress");
    return
  }
};