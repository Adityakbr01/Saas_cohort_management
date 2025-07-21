import { Role } from "@/configs/roleConfig";
import { CohortController } from "@/controllers/cohort.controller";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { uploadMedia } from "@/middleware/multerConfig";
import { validateRequest } from "@/middleware/validateRequest";
import { updateCohortSchema } from "@/utils/zod/cohort";
import express from "express";

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

//get all my org cohorts
router.get(
  "/getmentorCohorts",
  protect,
  restrictTo(Role.mentor),
  CohortController.getmentorCohorts
);

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


// ----------------------------------------------------


// Rate a cohort (1–5 stars) 
router.post(
  "/:id/rate",
  protect,
  restrictTo(Role.student,),
  CohortController.rateCohort
);

// Unrate a cohort
router.delete(
  "/:id/rate",
  protect,
  restrictTo(Role.student),
  CohortController.unrateCohort // ✅ Added unrateCohort function to handle unrating a cohort.
);


// Get cohort rating summary
router.get(
  "/:id/rating-summary",
  protect,
  restrictTo(Role.student),
  CohortController.getRatingSummary
);

// ----------------------------------------------------

router.post(
  "/:id/enroll",
  protect,
  restrictTo(Role.student),
);

export default router;
