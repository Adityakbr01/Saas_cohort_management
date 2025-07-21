import { markLessonComplete } from "@/controllers/progress.controller";
import { protect } from "@/middleware/authMiddleware";
import express from "express"
const router = express.Router();


router.post('/lesson-complete', protect, markLessonComplete);


export default router;