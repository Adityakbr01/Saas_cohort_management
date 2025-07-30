import express from "express";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { validateRequest } from "@/middleware/validateRequest";
import { uploadMedia } from "@/middleware/multerConfig";
import { LessonController } from "@/controllers/lesson.controller";
import {
  CodeDataSchema,
  createLessonSchema,
  updateLessonSchema,
} from "@/utils/zod/lessonSchema";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// ---------------- Rate Limiters ---------------- //
const createUpdateLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 }); // Create/Update lesson
const deleteLimiter = createDynamicRateLimiter({ maxRequests: 5, timeWindow: 10 });        // Delete lesson/code/resource
const uploadLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 });       // Upload code/resource
const getLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 });          // Get code/resources
const positionLimiter = createDynamicRateLimiter({ maxRequests: 15, timeWindow: 10 });     // Update position
// ------------------------------------------------ //

// Create lesson under a chapter
router.post(
  "/:chapterId",
  uploadMedia("video"),
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  validateRequest(createLessonSchema),
  LessonController.createLessonUnderChapter
);

// Update lesson
router.put(
  "/:lessonId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  validateRequest(updateLessonSchema),
  LessonController.updateLesson
);

// Delete lesson
router.delete(
  "/:lessonId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  deleteLimiter,
  LessonController.deleteLesson
);

// Upload code to lesson
router.post(
  "/:lessonId/uploadCode",
  protect,
  restrictTo(Role.organization, Role.mentor),
  uploadLimiter,
  validateRequest(CodeDataSchema),
  LessonController.uploadCode
);

// Upload resource to lesson
router.post(
  "/:lessonId/uploadResource",
  uploadMedia("file"),
  protect,
  restrictTo(Role.organization, Role.mentor),
  uploadLimiter,
  LessonController.uploadResource
);

// Get code examples of a lesson
router.get(
  "/:lessonId/code-examples",
  protect,
  restrictTo(Role.organization, Role.mentor),
  getLimiter,
  LessonController.getLessonCodeExamples
);

// Get resources of a lesson
router.get(
  "/:lessonId/resources",
  protect,
  restrictTo(Role.organization, Role.mentor),
  getLimiter,
  LessonController.getLessonResources
);

// Update code example
router.put(
  "/code-example/:codeId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  LessonController.updateCodeExample
);

// Delete code example
router.delete(
  "/code-example/:codeId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  deleteLimiter,
  LessonController.deleteCodeExample
);

// Update resource
router.put(
  "/resource/:resourceId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  LessonController.updateResource
);

// Delete resource
router.delete(
  "/resource/:resourceId",
  protect,
  restrictTo(Role.organization, Role.mentor),
  deleteLimiter,
  LessonController.deleteResource
);

// // Update lesson position
// router.put(
//   "/:lessonId/position",
//   protect,
//   restrictTo(Role.organization, Role.mentor),
//   positionLimiter,
//   LessonController.updateLessonPosition
// );

// // Get all lessons of a chapter
// router.get(
//   "/chapter/:chapterId",
//   protect,
//   getLimiter,
//   LessonController.getLessonsByChapter
// );

export default router;
