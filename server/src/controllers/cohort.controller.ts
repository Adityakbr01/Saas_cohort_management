import { Cohort } from "@/models/cohort.model";
import { Chapter } from "@/models/chapter.model";
import { wrapAsync } from "@/utils/wrapAsync";
import { sendSuccess } from "@/utils/responseUtil";
import { ApiError } from "@/utils/apiError";
import { CohortService } from "@/services/cohort.service";
import { Role } from "@/configs/roleConfig";
import { createCohortSchema } from "@/utils/zod/cohort";
import { uploadImage, uploadVideo } from "@/services/cloudinaryService";
import { authService } from "@/services/auth.service";

export const CohortController = {
  createCohort: wrapAsync(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const raw = req.body;

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
    };

    // ✅ Validate data
    const validated = createCohortSchema.parse(payload);

    // ✅ Handle file uploads
    const files = req.files as Express.Multer.File[];
    const thumbnail = files.find((file) => file.fieldname === "Thumbnail");
    const demoVideo = files.find((file) => file.fieldname === "demoVideo");

    // // ✅ Create cohort
    // const newCohort = await Cohort.create({
    //   ...validated,
    //   createdBy: userId,
    //   Thumbnail: thumbnailUrl,
    //   demoVideo: demoVideoUrl,
    //   chapters: chapterIds,
    // });

    const newCohort = await CohortService.createCohort({
      ...validated,
      createdBy: userId,
      thumbnail,
      demoVideo,
      chapters: validated.chapters,
    });

    sendSuccess(res, 201, "Cohort created successfully");
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
};
