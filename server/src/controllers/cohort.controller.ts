import { Cohort } from "@/models/cohort.model";
import { Chapter } from "@/models/chapter.model";
import { wrapAsync } from "@/utils/wrapAsync";
import { sendSuccess } from "@/utils/responseUtil";
import { ApiError } from "@/utils/apiError";
import { CohortService } from "@/services/cohort.service";
import { Role } from "@/configs/roleConfig";
import { createCohortSchema } from "@/utils/zod/cohort";
import { uploadImage, uploadVideo } from "@/services/cloudinaryService";

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
    prerequisites: typeof raw.prerequisites === "string" ? JSON.parse(raw.prerequisites) : [],
    chapters: typeof raw.chapters === "string" ? JSON.parse(raw.chapters) : [],
  };

  // ✅ Validate data
  const validated = createCohortSchema.parse(payload);

  // ✅ Handle file uploads
  const files = req.files as Express.Multer.File[];
  const thumbnail = files.find(file => file.fieldname === "Thumbnail");
  const demoVideo = files.find(file => file.fieldname === "demoVideo");

 

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
    const skip = (page - 1) * limit;

    const query = { isPrivate: false, isDeleted: false };

    const [cohorts, total] = await Promise.all([
      Cohort.find(query)
        .populate("mentor organization")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Cohort.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };

    sendSuccess(res, 200, "All cohorts", {
      cohorts,
      pagination: paginationInfo,
      meta: {
        totalCohorts: total,
        shownCohorts: cohorts.length,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  }),

  getCohortById: wrapAsync(async (req, res) => {
    const cohort = await Cohort.findById(req.params.id)
      .populate("mentor organization")
      .populate({
        path: "chapters",
        populate: {
          path: "lessons", // optional, if lessons are populated inside chapters
        },
      });

    if (!cohort) throw new ApiError(404, "Cohort not found");

    sendSuccess(res, 200, "Cohort found", cohort);
  }),

  updateCohort: wrapAsync(async (req, res) => {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) throw new ApiError(404, "Cohort not found");
    // Authorization (optional)
    if (
      req.user.role === Role.mentor &&
      cohort.mentor.toString() !== req.user.id
    ) {
      throw new ApiError(403, "You are not allowed to update this cohort");
    }
    const updated = await Cohort.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    sendSuccess(res, 200, "Cohort updated", updated);
  }),

  deleteCohort: wrapAsync(async (req, res) => {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    // Soft delete cohort
    cohort.isDeleted = true;
    await cohort.save();

    // Soft delete chapters too
    await Chapter.updateMany(
      { _id: { $in: cohort.chapters } },
      { $set: { isDeleted: true } }
    );

    sendSuccess(res, 200, "Cohort and its chapters soft-deleted", cohort);
  }),
};
