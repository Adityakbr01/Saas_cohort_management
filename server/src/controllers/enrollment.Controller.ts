// // controllers/enrollmentController.ts
import { Request, Response } from "express";
import { CohortEnrollment } from "../models/CohortEnrollment";
import { Cohort } from "../models/cohort.model";
import { sendSuccess } from "@/utils/responseUtil";
import UserCohortProgress from "../models/userCohortProgress";

export const enrollUserToCohort = async (req: Request, res: Response) => {
  try {
    const { userId, cohortId } = req.body;

    const existing = await CohortEnrollment.findOne({ user: userId, cohort: cohortId });
    if (existing) {
       res.status(400).json({ message: "User already enrolled in this cohort." });
       return
    }

    const enrollment = await CohortEnrollment.create({
      user: userId,
      cohort: cohortId,
    });

  
    sendSuccess(res, 200,"User enrolled successfully", enrollment);
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed", error });
  }
};

// Get all cohorts a user is enrolled in
export const getUserEnrolledCourses = async (req: Request, res: Response) => {
  try {
    // Use req.user.id from auth middleware
    const userId = req.user?.id || req.query.userId || req.body.userId;
    if (!userId) {
       res.status(400).json({ message: "Missing userId" });
       return
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
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrolled courses", error });
  }
};

// Get full cohort detail for a given cohortId
export const getCohortDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      console.error("[getCohortDetail] req.user is missing. Auth middleware may have failed.");
       res.status(401).json({ message: "Unauthorized: user not found in request" });
       return
    }
    const userId = req.user.id;
    // Deep populate: mentor, chapters, lessons, and for each lesson: codeExamples and resources
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
       res.status(404).json({ message: "Cohort not found" });
       return
    }

    // Fetch user progress for this cohort
    const userProgress = await UserCohortProgress.findOne({ user: userId, cohort: id });
    const completedLessonIds = userProgress?.completedLessons?.map((l: any) => l.lessonId.toString()) || [];
    // Calculate total lessons and byType totals
    let totalLessons = 0;
    let totalByType: Record<string, number> = { video: 0, reading: 0, quiz: 0, assignment: 0, project: 0 };
    if (cohort && cohort.chapters) {
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
    // Calculate completed by type
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
    // Calculate byType percentages
    const byTypePercent: Record<string, number> = {};
    for (const type of Object.keys(totalByType)) {
      byTypePercent[type] = totalByType[type] > 0 ? Math.round((completedByType[type] / totalByType[type]) * 100) : 0;
    }
    const progressData = userProgress
      ? {
          overall: totalLessons > 0 ? (userProgress.completedLessons.length / totalLessons) : 0,
          byType: byTypePercent,
          completedLessons: userProgress.completedLessons.length,
          totalLessons,
          timeSpent: userProgress.timeSpentSeconds ? `${Math.floor(userProgress.timeSpentSeconds / 3600)}h ${Math.floor((userProgress.timeSpentSeconds % 3600) / 60)}m` : "0h 0m",
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

    // Type guard for mentor
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

    // Mark lessons as completed based on user progress
    const chapters = (cohort.chapters || []).map((chapter: any) => ({
      id: chapter._id,
      title: chapter.title,
      description: chapter.description,
      estimatedTime: chapter.estimatedTime || "",
      lessons: (chapter.lessons || []).map((lesson: any) => ({
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
      isCompleted: chapter.isCompleted || false,
      isBookmarked: chapter.isBookmarked || false,
      progress: chapter.progress || 0,
    }));

    const cohortData = {
      id: cohort._id,
      title: cohort.title,
      description: cohort.description,
      shortDescription: cohort.shortDescription,
      instructor,
      progress: progressData,
      chapters,
    };
     sendSuccess(res, 200, "Cohort detail fetched", cohortData);
     return
  } catch (error) {
    const err = error as Error;
    console.error("[getCohortDetail] Error:", err.stack || err);
     res.status(500).json({ message: "Failed to fetch cohort detail", error: err.message });
     return


  }
};