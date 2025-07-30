import { Role } from "@/configs/roleConfig";
import { CohortController } from "@/controllers/cohort.controller";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { uploadMedia } from "@/middleware/multerConfig";
import { validateRequest } from "@/middleware/validateRequest";
import { updateCohortSchema } from "@/utils/zod/cohort";
import express from "express";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// ----------------- Rate Limiters ------------------ //
const createUpdateLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 });  // For POST/PUT
const getCohortLimiter = createDynamicRateLimiter({ maxRequests: 50, timeWindow: 10 });     // For public GET
const mentorCohortLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 });  // Mentor dashboard
const deleteLimiter = createDynamicRateLimiter({ maxRequests: 5, timeWindow: 10 });         // DELETE caution
const ratingLimiter = createDynamicRateLimiter({ maxRequests: 20, timeWindow: 10 });        // Rate/Unrate
const ratingSummaryLimiter = createDynamicRateLimiter({ maxRequests: 30, timeWindow: 10 }); // Rating summary
const enrollLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 });        // Enroll
// -------------------------------------------------- //

// Create a new cohort
router.post(
  "/",
  uploadMedia(),
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  CohortController.createCohort
);

// Get all cohorts (public or wide access)
router.get("/", getCohortLimiter, CohortController.getAllCohorts);

// Get all cohorts for mentor/org
router.get(
  "/getmentorCohorts",
  protect,
  restrictTo(Role.mentor),
  mentorCohortLimiter,
  CohortController.getmentorCohorts
);

// Get single cohort with chapters
router.get("/:id", getCohortLimiter, CohortController.getCohortById);

// Update cohort
router.put(
  "/:id",
  validateRequest(updateCohortSchema),
  protect,
  restrictTo(Role.organization, Role.mentor),
  createUpdateLimiter,
  CohortController.updateCohort
);

// Delete cohort
router.delete(
  "/:id",
  protect,
  restrictTo(Role.organization, Role.mentor),
  deleteLimiter,
  CohortController.deleteCohort
);

// Rate a cohort
router.post(
  "/:id/rate",
  protect,
  ratingLimiter,
  CohortController.rateCohort
);

// Unrate a cohort
router.delete(
  "/:id/rate",
  protect,
  ratingLimiter,
  CohortController.unrateCohort
);

// Get cohort rating summary
router.get(
  "/:id/rating-summary",
  protect,
  restrictTo(Role.student),
  ratingSummaryLimiter,
  CohortController.getRatingSummary
);

// Enroll in cohort
router.post(
  "/:id/enroll",
  protect,
  restrictTo(Role.student),
  enrollLimiter,
  async (req, res) => {
    try {
      const { userId, cohortId } = req.body;
      if (!userId || !cohortId) {
        throw new Error("User ID and Cohort ID are required");
      }
      res.status(200).json({ message: "Enrollment successful" });
    } catch (error) {
      if(error instanceof Error) {
      res.status(400).json({ error: error.message });
      }
    }
  }
);

export default router;
