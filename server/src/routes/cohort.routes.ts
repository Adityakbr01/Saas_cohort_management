import express from "express";
import { Role } from "@/configs/roleConfig";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { CohortController } from "@/controllers/cohort.controller";
import { createCohortSchema, updateCohortSchema } from "@/utils/zod/cohort";
import { uploadMedia } from "@/middleware/multerConfig";

const router = express.Router();

// Create a new cohort
router.post(
  "/",
  uploadMedia(),
  protect,
  restrictTo(Role.organization, Role.mentor),
  CohortController.createCohort
);

// Get all cohorts
router.get("/", CohortController.getAllCohorts);

// Get single cohort with chapters
router.get("/:id", CohortController.getCohortById);

// Update cohort
router.put(
  "/:id",
  validateRequest(updateCohortSchema),
  protect,
  restrictTo(Role.organization, Role.mentor),
  CohortController.updateCohort
);

// Delete cohort
router.delete(
  "/:id",
  protect,
  restrictTo(Role.organization, Role.mentor),
  CohortController.deleteCohort
);

export default router;
