import express from "express";
import { enrollUserToCohort, getCohortDetail, getUserEnrolledCourses } from "../controllers/enrollment.Controller";
import { protect } from "../middleware/authMiddleware";
import { markLessonComplete } from "@/controllers/progress.controller";

const router = express.Router();

router.post("/enroll", protect, enrollUserToCohort);
router.get("/enrolled-courses", protect, getUserEnrolledCourses);
router.get("/cohorts/:id", protect, getCohortDetail);
router.post('/progress/lesson-complete', protect, markLessonComplete);

export default router;
