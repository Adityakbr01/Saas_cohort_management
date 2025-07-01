import { Cohort } from "@/models/cohort.model";
import { Chapter } from "@/models/chapter.model";
import Mentor from "@/models/mentor.model";

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
    chapters, // ← this is an array of chapter objects
  }: any) {
    if (mentor) {
      const mentorExists = await Mentor.findById(mentor);
      if (!mentorExists) {
        throw new Error("Mentor does not exist");
      }
    }

    // 1. Insert chapters if present
    let chapterIds: string[] = [];

    if (chapters && chapters.length > 0) {
      const createdChapters = await Chapter.insertMany(chapters);
      chapterIds = createdChapters.map((chapter) => chapter._id.toString());
    }

    // 2. Create cohort with chapter ObjectIds
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
    });

    return await newCohort.save();
  },
};
