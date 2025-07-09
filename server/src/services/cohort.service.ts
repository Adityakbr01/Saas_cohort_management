import { Cohort, ICohort } from "@/models/cohort.model";
import { Chapter } from "@/models/chapter.model";
import Mentor from "@/models/mentor.model";
import Organization from "@/models/organization.model";
import { ApiError } from "@/utils/apiError";
import { uploadImage, uploadVideo } from "./cloudinaryService";
import { Role } from "@/configs/roleConfig";

export const CohortService = {
  async createCohort({
    title,
    shortDescription,
    description,
    mentor,
    organization,
    startDate,
    endDate,
    maxCapacity,
    status,
    category,
    difficulty,
    students,
    createdBy,
    schedule,
    location,
    progress,
    completionRate,
    language,
    tags,
    prerequisites,
    certificateAvailable,
    chapters,
    thumbnail,
    demoVideo,
    payload,
  }: any) {
    // ✅ Validate mentor existence
    if (mentor) {
      const mentorExists = await Mentor.findById(mentor);
      if (!mentorExists) {
        throw new ApiError(404, "Mentor does not exist");
      }
    }

    // ✅ Validate organization existence
    if (organization) {
      const orgExists = await Organization.findById(organization);
      if (!orgExists) {
        throw new ApiError(404, "Organization does not exist");
      }
    }

    let orgExists;
    if (organization) {
      orgExists = await Organization.findById(organization);
      if (!orgExists) {
        throw new ApiError(404, "Organization does not exist");
      }

      // ✅ Fetch all cohorts of the org
      const cohorts = await Cohort.find({ organization });

      // ✅ Consider both active and upcoming (to prevent future overuse)
      const activeCohorts = cohorts.filter((cohort) =>
        ["active", "upcoming"].includes(cohort.status)
      );

      if (
        !orgExists.subscriptionMeta.maxCourses ||
        orgExists.subscriptionMeta.maxCourses === 0
      ) {
        throw new ApiError(400, "Organization does not have a subscription");
      }

      // ✅ Course limit check
      if (activeCohorts.length >= orgExists.subscriptionMeta.maxCourses) {
        throw new ApiError(
          400,
          `Organization has reached course limit (${orgExists.subscriptionMeta.maxCourses})`
        );
      }

      // ✅ Student capacity check
      const totalStudentsInUse = activeCohorts.reduce(
        (sum, cohort) => sum + (cohort.maxCapacity || 0),
        0
      );

      const remainingStudentSlots =
        orgExists.subscriptionMeta.maxStudents - totalStudentsInUse;

      if (maxCapacity > remainingStudentSlots) {
        throw new ApiError(
          400,
          `Max student capacity exceeded. Only ${remainingStudentSlots} slots available.`
        );
      }

      // ✅ (Optional) Mentor quota check (inviteMentor flow me lagana ho to)
      // if (orgExists.Members?.length >= orgExists.subscriptionMeta.maxMentors) {
      //   throw new ApiError(400, "Mentor limit reached for organization");
      // }
    }

    // ✅ Create chapter documents if given
    let chapterIds: string[] = [];

    let chaptersArray: any[] = [];
    if (typeof chapters === "string") {
      try {
        chaptersArray = JSON.parse(chapters);
      } catch (err) {
        throw new ApiError(400, "Invalid chapters format (not valid JSON)");
      }
    } else if (Array.isArray(chapters)) {
      chaptersArray = chapters;
    }

    let thumbnailUrl = "";
    let demoVideoUrl = "";

    if (thumbnail) {
      const uploadedImage = await uploadImage(thumbnail);
      thumbnailUrl = uploadedImage.secure_url;
    }

    if (demoVideo) {
      const uploadedVideo = await uploadVideo(demoVideo);

      demoVideoUrl = uploadedVideo.secure_url;
    }

    //   // ✅ Insert chapters
    //   let chapterIds: string[] = [];
    //   if (payload.chapters?.length) {
    //     const createdChapters = await Chapter.insertMany(payload.chapters);
    //     chapterIds = createdChapters.map(ch => ch._id.toString());
    //   }

    // if (chaptersArray.length > 0) {
    //   const createdChapters = await Chapter.insertMany(chaptersArray);
    //   chapterIds = createdChapters.map((ch) => ch._id.toString());
    // }

    // ✅ Finally, create cohort
    const newCohort = new Cohort({
      title,
      shortDescription,
      description,
      mentor,
      organization,
      startDate,
      endDate,
      maxCapacity,
      status,
      category,
      difficulty,
      students,
      createdBy,
      schedule,
      location,
      progress,
      completionRate,
      language,
      tags,
      prerequisites,
      certificateAvailable,
      chapters: chapterIds,
      Thumbnail: thumbnailUrl,
      demoVideo: demoVideoUrl,
    });

    return await newCohort.save();
  },
  async getAllCohorts(page: number, limit: number) {
    const skip = (page - 1) * limit; // Adjust skip based on page and limit
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

    return {
      cohorts,
      pagination: paginationInfo,
      meta: {
        totalCohorts: total,
        shownCohorts: cohorts.length,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  },
  async getmentorCohorts(mentorId: string, page: number, limit: number) {
    const skip = (page - 1) * limit; // Adjust skip based on page and limit
    const query = { mentor: mentorId, isDeleted: false };

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
    return {
      cohorts,
      pagination: paginationInfo,
      meta: {
        totalCohorts: total,
        shownCohorts: cohorts.length,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  },
  async getCohortById(id: string) {
 const cohort = await Cohort.findOne({ _id: id, isDeleted: false })
  .populate("mentor")
  .populate("organization")
  .populate({
    path: "chapters",
    match: { isDeleted: false },
    populate: {
      path: "lessons",
      model: "Lesson",
      match: { isDeleted: false },
    },
  });
    if (!cohort) throw new ApiError(404, "Cohort not found");
    return cohort;
  },
  async updateCohort(
    userId: string,
    userRole: string,
    cohortId: string,
    payload: Partial<ICohort>
  ) {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    // 🔐 Permission check for mentors
    if (userRole === Role.mentor && cohort.mentor.toString() !== userId) {
      throw new ApiError(403, "You are not allowed to update this cohort");
    }

    // Optional: Org or admin-level permission check

    const updated = await Cohort.findByIdAndUpdate(cohortId, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ApiError(500, "Failed to update cohort");

    return updated;
  },
  async deleteCohort(cohortId: string, userId: string, userRole: string) {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    if (userRole === Role.mentor && cohort.mentor.toString() !== userId) {
      throw new ApiError(403, "You are not allowed to delete this cohort");
    }

    const session = await Cohort.startSession();
    session.startTransaction();

    try {
      cohort.isDeleted = true;
      await cohort.save({ session });

      await Chapter.updateMany(
        { _id: { $in: cohort.chapters } },
        { $set: { isDeleted: true } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return { success: true, message: "Cohort and chapters deleted" };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw new ApiError(500, "Failed to delete cohort and its chapters");
    }
  },
};
