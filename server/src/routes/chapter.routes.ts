import express from "express";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { createChapterSchema, updateChapterSchema } from "@/utils/zod/chapterSchema";
import { ChapterController } from "@/controllers/chapter.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { uploadMedia } from "@/middleware/multerConfig";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// ------------------- Rate Limiters ------------------- //
const createUpdateLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 }); // 10 req / 10 min
const positionLimiter = createDynamicRateLimiter({ maxRequests: 15, timeWindow: 10 }); // 15 req / 10 min
const getChaptersLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 }); // 30 req / 10 min
const deleteLimiter = createDynamicRateLimiter({ maxRequests: 5, timeWindow: 10 }); // 5 req / 10 min
// ----------------------------------------------------- //

// ✅ Create chapter under a cohort
router.post(
  "/cohort/:cohortId",
  uploadMedia("Thumbnail"),
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  validateRequest(createChapterSchema),
  ChapterController.createChapterUnderCohort
);

// ✅ Update chapter
router.put(
  "/cohort/:cohortId/:chapterId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  validateRequest(updateChapterSchema),
  ChapterController.updateChapter
);

// ✅ Update chapter position
router.put(
  "/:chapterId/position",
  protect,
  restrictTo(Role.organization, Role.mentor),
  positionLimiter,
  ChapterController.updateChapterPosition
);

// ✅ Get all chapters of a cohort
router.get(
  "/cohort/:cohortId",
  protect,
  getChaptersLimiter,
  ChapterController.getChaptersByCohort
);

// ✅ Delete chapter
router.delete(
  "/:chapterId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  deleteLimiter,
  ChapterController.deleteChapter
);

export default router;
