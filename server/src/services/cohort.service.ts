import { Role } from "@/configs/roleConfig";
import { Chapter } from "@/models/chapter.model";
import { Cohort, ICohort } from "@/models/cohort.model";
import { CohortRating } from "@/models/cohortRating.model";
import { Lesson } from "@/models/lesson.model";
import Mentor from "@/models/mentor.model";
import Organization from "@/models/organization.model";
import { ApiError } from "@/utils/apiError";
import { uploadImage, uploadVideo } from "./cloudinaryService";
import mongoose from "mongoose";

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
    duration,
    price,
    originalPrice,
    discount,
    isPrivate,
    activateOn,
  }: any) {
    // ✅ Validate mentor existence

    console.log(mentor, organization);
    if (mentor) {
      const mentorExists = await Mentor.findById(mentor || createdBy);
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




    let thumbnailUrl: string | undefined;
        let demoVideoUrl: string | undefined;
    
        if (thumbnail && thumbnail.buffer) {
      try {
        const thumbnailUploadRes = await uploadImage(thumbnail);
        thumbnailUrl = thumbnailUploadRes?.secure_url;
      } catch (err) {
        console.error("❌ Thumbnail upload failed:", err);
        throw new ApiError(400, "Thumbnail upload failed");
      }
    }
    
        if (demoVideo && demoVideo.buffer) {
      try {
        const demoVideoUploadRes = await uploadVideo(demoVideo);
        demoVideoUrl = demoVideoUploadRes?.secure_url;
      } catch (err) {
        console.error("❌ Demo video upload failed:", err);
        throw new ApiError(400, "Demo video upload failed");
      }
    }
        console.log("Thumbnail buffer size:", thumbnail?.buffer?.length);
    console.log("Demo video buffer size:", demoVideo?.buffer?.length);
    
        if (!thumbnailUrl) {
          throw new ApiError(400, "Thumbnail upload failedssss");
        }
    
        if (!demoVideoUrl) {
          throw new ApiError(400, "Demo video upload failed");
        }
    

        // 💸 Apply discount logic before update
    if (originalPrice && discount !== undefined) {
      const discountAmount = (originalPrice *discount) / 100;
      price = Math.round(originalPrice - discountAmount);
      discount = Math.round(discount);
    }


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
      duration: `${duration} week`,
      price,
      originalPrice,
      discount,
      isPrivate,
      activateOn, // ✅ NEW FIELD
    });

    return await newCohort.save();
  },
  async getAllCohorts(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const query = { isPrivate: false, isDeleted: false };

    const [cohortsWithRating, total] = await Promise.all([
      Cohort.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },

        // 👇 Lookup ratings from CohortRating model
        {
          $lookup: {
            from: "cohortratings", // 🔴 collection name (in lowercase & plural usually)
            localField: "_id",
            foreignField: "cohortId",
            as: "ratings",
          },
        },

        // 👇 Add calculated fields
        {
          $addFields: {
            totalRatings: { $size: "$ratings" },
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$ratings" }, 0] },
                {
                  $avg: "$ratings.rating",
                },
                0,
              ],
            },
            ratingsDistribution: {
              $let: {
                vars: {
                  dist: {
                    $map: {
                      input: [1, 2, 3, 4, 5],
                      as: "star",
                      in: {
                        k: { $toString: "$$star" },
                        v: {
                          $size: {
                            $filter: {
                              input: "$ratings",
                              cond: { $eq: ["$$this.rating", "$$star"] },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                in: {
                  $arrayToObject: "$$dist",
                },
              },
            },
          },
        },

        // 👇 Remove heavy ratings array from output
        {
          $project: {
            ratings: 0,
          },
        },

        // 👇 Optional: Populate mentor and organization manually
        {
          $lookup: {
            from: "mentors",
            localField: "mentor",
            foreignField: "_id",
            as: "mentor",
          },
        },
        { $unwind: "$mentor" },
        {
          $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization",
          },
        },
        { $unwind: "$organization" },
      ]),

      // ✅ Count for pagination
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
      cohorts: cohortsWithRating,
      pagination: paginationInfo,
      meta: {
        totalCohorts: total,
        shownCohorts: cohortsWithRating.length,
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
    const [cohort] = await Cohort.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), isDeleted: false } },

      // Lookup Ratings
      {
        $lookup: {
          from: "cohortratings",
          localField: "_id",
          foreignField: "cohortId",
          as: "ratings",
        },
      },

      // Add rating fields
      {
        $addFields: {
          totalRatings: { $size: "$ratings" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              0,
            ],
          },
          ratingsDistribution: {
            $let: {
              vars: {
                dist: {
                  $map: {
                    input: [1, 2, 3, 4, 5],
                    as: "star",
                    in: {
                      k: { $toString: "$$star" },
                      v: {
                        $size: {
                          $filter: {
                            input: "$ratings",
                            cond: { $eq: ["$$this.rating", "$$star"] },
                          },
                        },
                      },
                    },
                  },
                },
              },
              in: { $arrayToObject: "$$dist" },
            },
          },
        },
      },

      { $project: { ratings: 0 } },

      // Lookup mentor
      {
        $lookup: {
          from: "mentors",
          localField: "mentor",
          foreignField: "_id",
          as: "mentor",
        },
      },
      { $unwind: { path: "$mentor", preserveNullAndEmptyArrays: true } },

      // Lookup organization
      {
        $lookup: {
          from: "organizations",
          localField: "organization",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },

      // Lookup chapters (with lessons inside)
      {
        $lookup: {
          from: "chapters",
          let: { chapterIds: "$chapters" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$chapterIds"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "lessons",
                localField: "lessons",
                foreignField: "_id",
                as: "lessons",
                pipeline: [
                  { $match: { isDeleted: false } },
                ],
              },
            },
          ],
          as: "chapters",
        },
      },
    ]);
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

    // 💸 Apply discount logic before update
    if (payload.originalPrice && payload.discount !== undefined) {
      const discountAmount = (payload.originalPrice * payload.discount) / 100;
      payload.price = Math.round(payload.originalPrice - discountAmount);
      payload.discount = Math.round(payload.discount);
    }

    if (payload.limitedTimeOffer) {
      const { startDate, endDate } = payload.limitedTimeOffer;

      if (startDate && typeof startDate === "string") {
        payload.limitedTimeOffer.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === "string") {
        payload.limitedTimeOffer.endDate = new Date(endDate);
      }
    }

    

    console.log(payload)

    // ✅ Update cohort
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

    try {
      cohort.isDeleted = true;
      await cohort.save();

      await Chapter.updateMany(
        { _id: { $in: cohort.chapters } },
        { $set: { isDeleted: true } }
      );

      await Lesson.updateMany(
        { chapter: { $in: cohort.chapters } },
        { $set: { isDeleted: true } }
      );

      await Organization.updateMany(
        { _id: cohort.organization },
        { $pull: { cohorts: cohort._id } }
      );


      return { success: true, message: "Cohort and chapters deleted" };
    } catch (err) {
      console.error("Failed to delete cohort and chapters:", err);
      throw new ApiError(500, "Failed to delete cohort and its chapters");
    }
  },
  async rateCohort(cohortId: string, userId: string, rating: number) {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    const existingRating = await CohortRating.findOne({
      cohortId,
      userId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return existingRating;
    }

    const newRating = new CohortRating({
      cohortId,
      userId,
      rating,
    });

  if (!cohort.ratingSummary) {
  cohort.ratingSummary = [];
}

cohort.ratingSummary.push(newRating._id);

// ✅ Use old count * old rating logic
const oldTotal = cohort.rating * (cohort.ratingSummary.length - 1);
const newTotal = oldTotal + rating;
const newAvg = Math.round(newTotal / cohort.ratingSummary.length);

cohort.rating = newAvg;

await cohort.save();


    await newRating.save();
    return newRating;
  },
  async unrateCohort(cohortId: string, userId: string) {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    const existingRating = await CohortRating.findOne({
      cohortId,
      userId,
    });
    if (!existingRating) {
      throw new ApiError(404, "Rating not found");
    }
    await existingRating.deleteOne();
    return { success: true, message: "Rating deleted" };
  },
  async getRatingSummary(cohortId: string) {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) throw new ApiError(404, "Cohort not found");

    const ratings = await CohortRating.find({ cohortId });

    const summary = {
      totalRatings: ratings.length,
      averageRating: ratings.length
        ? ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length
        : 0,
      ratingsDistribution: {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
      },
    };

    ratings.forEach((rating) => {
      const key = rating.rating.toString() as keyof typeof summary.ratingsDistribution;
      summary.ratingsDistribution[key]++;
    });

    return summary;
  },
};
