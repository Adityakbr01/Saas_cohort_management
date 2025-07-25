import { markLessonComplete } from "@/controllers/progress.controller";
import express from "express";
import { enrollUserToCohort, getCohortDetail, getLessonProgress, getProgress, getUserEnrolledCourses, LessonDurationUpdate, saveLessonProgress } from "../controllers/enrollment.Controller";
import { protect } from "../middleware/authMiddleware";
import userCohortProgress from "@/models/userCohortProgress";

const router = express.Router();

router.post("/enroll", protect, enrollUserToCohort);
router.get("/enrolled-courses", protect, getUserEnrolledCourses);
router.get("/cohorts/:id", protect, getCohortDetail);
router.post('/progress/lesson-complete', protect, markLessonComplete);
router.post('/progress/lesson/duration', protect, LessonDurationUpdate);
router.get('/progress/get', protect, getProgress);
router.post('/progress/save', protect, saveLessonProgress);


export default router;
