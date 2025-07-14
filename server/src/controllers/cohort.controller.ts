import { CohortService } from "@/services/cohort.service";
import { ApiError } from "@/utils/apiError";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { createCohortSchema } from "@/utils/zod/cohort";

export const CohortController = {
  createCohort: wrapAsync(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const raw = req.body;

    console.log(req.body)

    // ✅ Convert/parse values
    const payload = {
      ...raw,
      maxCapacity: Number(raw.maxCapacity),
      certificateAvailable: raw.certificateAvailable === "true",
      tags: typeof raw.tags === "string" ? JSON.parse(raw.tags) : [],
      prerequisites:
        typeof raw.prerequisites === "string"
          ? JSON.parse(raw.prerequisites)
          : [],
      chapters:
        typeof raw.chapters === "string" ? JSON.parse(raw.chapters) : [],
      duration: Number(raw.duration),
      price: Number(raw.price),
      originalPrice: Number(raw.originalPrice),
      discount: Number(raw.discount),
      activateOn: raw.activateOn ? new Date(raw.activateOn) : undefined, // ✅ NEW FIELD
    };

    // ✅ Validate data
    const validated = createCohortSchema.parse(payload);

    // ✅ Handle file uploads
    const files = req.files as Express.Multer.File[];
    const thumbnail = files.find((file) => file.fieldname === "Thumbnail");
    const demoVideo = files.find((file) => file.fieldname === "demoVideo");


    const newCohort = await CohortService.createCohort({
      ...validated,
      createdBy: userId,
      thumbnail: thumbnail,
      demoVideo: demoVideo,
      chapters: validated.chapters,
      duration: validated.duration,
      price: validated.price,
      originalPrice: validated.originalPrice,
      discount: validated.discount,
      limitedTimeOffer: validated.limitedTimeOffer,
      mentor: validated.mentor,
      activateOn: validated.activateOn,
    });

    sendSuccess(res, 201, "Cohort created successfully", newCohort);
  }),
  getAllCohorts: wrapAsync(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { cohorts, pagination, meta } = await CohortService.getAllCohorts(
      page,
      limit
    );

    sendSuccess(res, 200, "All cohorts", {
      cohorts,
      pagination,
      meta,
    });
  }),
  getmentorCohorts: wrapAsync(async (req, res) => {
    const mentorId = req.user?.id;
    if (!mentorId) throw new ApiError(401, "Unauthorized");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { cohorts, pagination, meta } = await CohortService.getmentorCohorts(
      mentorId,
      page,
      limit
    );

    sendSuccess(res, 200, "All cohorts", {
      cohorts,
      pagination,
      meta,
    });
  }),
  getCohortById: wrapAsync(async (req, res) => {
    const cohort = await CohortService.getCohortById(req.params.id);
    sendSuccess(res, 200, "Cohort found", cohort);
  }),
  updateCohort: wrapAsync(async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) throw new ApiError(401, "Unauthorized");
    const cohortId = req.params.id;
    const updated = await CohortService.updateCohort(
      userId,
      userRole,
      cohortId,
      req.body
    );
    sendSuccess(res, 200, "Cohort updated", updated);
  }),
  deleteCohort: wrapAsync(async (req, res) => {
    const cohortId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const cohort = await CohortService.deleteCohort(cohortId, userId, userRole);

    sendSuccess(res, 200, "Cohort and its chapters soft-deleted", cohort);
  }),
  rateCohort: wrapAsync(async (req, res) => {
    const cohortId = req.params.id;
    const userId = req.user.id;
    const rating = req.body.rating; // ✅ recived rating from body like { rating: 5 }
    if (!rating) throw new ApiError(400, "Rating is required");
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
    if (typeof rating !== "number") throw new ApiError(400, "Rating must be a number");
    if (rating % 1 !== 0) throw new ApiError(400, "Rating must be an integer");

    const rated = await CohortService.rateCohort(cohortId, userId, rating); // ✅ Call the rateCohort function with the cohortId, userId, and rating.

    sendSuccess(res, 200, "Cohort rated", rated);
  }),
  unrateCohort: wrapAsync(async (req, res) => {
    const cohortId = req.params.id;
    const userId = req.user.id;
    if (!userId) throw new ApiError(401, "Unauthorized");
    if (!cohortId) throw new ApiError(400, "Cohort ID is required");
    if (typeof cohortId !== "string") throw new ApiError(400, "Cohort ID must be a string");

    const unrated = await CohortService.unrateCohort(cohortId, userId);

    sendSuccess(res, 200, "Cohort unrated", unrated);
  }),

  getRatingSummary: wrapAsync(async (req, res) => {
    const cohortId = req.params.id;
    const userId = req.user.id;
    if (!userId) throw new ApiError(401, "Unauthorized");
    if (!cohortId) throw new ApiError(400, "Cohort ID is required");
    if (typeof cohortId !== "string") throw new ApiError(400, "Cohort ID must be a string");

    const summary = await CohortService.getRatingSummary(cohortId);

    sendSuccess(res, 200, "Rating summary", summary);
  }),

};
