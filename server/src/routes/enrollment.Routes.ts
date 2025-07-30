import { markLessonComplete } from "@/controllers/progress.controller";
import express from "express";
import {
    enrollUserToCohort,
    getCohortDetail,
    getLessonProgress,
    getProgress,
    getUserEnrolledCourses,
    LessonDurationUpdate,
    saveLessonProgress,
} from "../controllers/enrollment.Controller";
import { protect } from "../middleware/authMiddleware";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// Rate limiters
const enrollLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 5 }); // 10 req / 5 min
const coursesLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 }); // 30 req / 10 min
const cohortDetailLimiter = createDynamicRateLimiter({ maxRequests: 20, timeWindow: 10 }); // 20 req / 10 min
const lessonCompleteLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 }); // 30 req / 10 min
const lessonDurationLimiter = createDynamicRateLimiter({ maxRequests: 60, timeWindow: 10 }); // 60 req / 10 min (more frequent)
const progressGetLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 }); // 30 req / 10 min
const progressSaveLimiter = createDynamicRateLimiter({ maxRequests: 60, timeWindow: 10 }); // 60 req / 10 min (frequent)

router.post("/enroll", protect, enrollLimiter, enrollUserToCohort);

router.get("/enrolled-courses", protect, coursesLimiter, getUserEnrolledCourses);

router.get("/cohorts/:id", protect, cohortDetailLimiter, getCohortDetail);

router.post('/progress/lesson-complete', protect, lessonCompleteLimiter, markLessonComplete);

router.post('/progress/lesson/duration', protect, lessonDurationLimiter, LessonDurationUpdate);

router.get('/progress/get', protect, progressGetLimiter, getProgress);

router.post('/progress/save', protect, progressSaveLimiter, saveLessonProgress);



export default router;
