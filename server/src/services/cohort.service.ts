import { Cohort } from "@/models/cohort.model";
import { Chapter } from "@/models/chapter.model";
import Mentor from "@/models/mentor.model";
import Organization from "@/models/organization.model";
import { ApiError } from "@/utils/apiError";
import { uploadImage, uploadVideo } from "./cloudinaryService";

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
      demoVideo:demoVideoUrl,
    });

    return await newCohort.save();
  },
};
