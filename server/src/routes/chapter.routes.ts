// ✅ routes/chapter.routes.ts
import express from "express";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { createChapterSchema, updateChapterSchema } from "@/utils/zod/chapterSchema";
import { ChapterController } from "@/controllers/chapter.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { uploadMedia } from "@/middleware/multerConfig";

const router = express.Router();

// ✅ Create chapter under a cohort
router.post(
  "/cohort/:cohortId",
  uploadMedia("Thumbnail"),
  protect,
  restrictTo(Role.organization, Role.mentor),
  validateRequest(createChapterSchema),
  ChapterController.createChapterUnderCohort
);

// ✅ Update chapter
router.put(
  "/cohort/:cohortId/:chapterId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  validateRequest(updateChapterSchema),
  ChapterController.updateChapter
);

// ✅ Update chapter position
router.put(
  "/:chapterId/position",
  protect,
  restrictTo(Role.organization, Role.mentor),
  ChapterController.updateChapterPosition
);

// ✅ Get all chapters of a cohort
router.get("/cohort/:cohortId", protect, ChapterController.getChaptersByCohort);

// ✅ Delete chapter
router.delete(
  "/:chapterId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  ChapterController.deleteChapter
);

export default router;