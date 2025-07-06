import { Role } from "@/configs/roleConfig";
import { Chapter } from "@/models/chapter.model";
import { Cohort } from "@/models/cohort.model";
import { ApiError } from "@/utils/apiError";
import mongoose, { Types } from "mongoose";

export const ChapterService = {
  async createChapter(cohortId: string, data: any,userId: string) {

    const cohort = await Cohort.findOne({ _id: cohortId, mentor: userId });
    if (!cohort) {
      throw new ApiError( 404, "Cohort not found");
    }

    const existingChapters = await Chapter.find({ cohort: cohort._id })
      .sort({ position: -1 })
      .limit(1);
    const nextPosition =
      existingChapters.length > 0 ? existingChapters[0].position + 1 : 1;

    const chapter = new Chapter({
      ...data,
      cohort: cohort._id,
      position: nextPosition,
    });

    const savedChapter = await chapter.save();

    // Push the chapter ID to cohort.chapters
    cohort.chapters.push(savedChapter._id as Types.ObjectId);
    await cohort.save();

    return savedChapter;
  },
  async updateChapter ({
  chapterId,
  cohortId,
  updates,
  userId,
  userRole,
}: {
  chapterId: string;
  cohortId: string;
  updates: {
    title?: string;
    shortDescription?: string;
    totalLessons?: number;
    totalDuration?: number;
    Thumbnail?: string;
    isPrivate?: boolean;
    status?: "upcoming" | "inProgress" | "completed";
    position?: number;
  };
  userId: string;
  userRole: string;
}) {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) throw new Error("Chapter not found");

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) throw new Error("Cohort not found");

  // ✅ Authorization Check
  const isMentor = userRole === Role.mentor && cohort.mentor?.toString() === userId;
  const isOrg = userRole === Role.organization && cohort.organization?.toString() === userId;
  if (!isMentor && !isOrg) throw new Error("Unauthorized: You can't update this chapter");



  // ✅ Update other fields
  chapter.title = updates.title ?? chapter.title;
  chapter.shortDescription = updates.shortDescription ?? chapter.shortDescription;
  chapter.totalLessons = updates.totalLessons ?? chapter.totalLessons;
  chapter.totalDuration = updates.totalDuration ?? chapter.totalDuration;
  chapter.Thumbnail = updates.Thumbnail ?? chapter.Thumbnail;
  chapter.isPrivate = updates.isPrivate ?? chapter.isPrivate;
  chapter.status = updates.status ?? chapter.status;

  await chapter.save();
  return chapter;
},
  async  updateChapterPosition({
  chapterId,
  cohortId,
  newPosition,
}: {
  chapterId: string;
  cohortId: string;
  newPosition: number;
}) {
  try {
    // Step 1: Get the current chapter
    const chapter = await Chapter.findOne({ _id: chapterId, cohort: cohortId });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const currentPosition = chapter.position;

    // Step 2: If positions are the same, no need to update
    if (currentPosition === newPosition) {
      return chapter;
    }

    // Step 3: Temporarily set the current chapter's position to a non-conflicting value
    const tempPosition = -1; // Use a negative number to avoid conflicts
    chapter.position = tempPosition;
    await chapter.save();

    // Step 4: Shift other chapters to accommodate new position
    if (newPosition < currentPosition) {
      // Moving chapter up (e.g., from position 5 to 3)
      await Chapter.updateMany(
        {
          cohort: cohortId,
          position: { $gte: newPosition, $lt: currentPosition },
          _id: { $ne: chapterId },
        },
        { $inc: { position: 1 } }
      );
    } else {
      // Moving chapter down (e.g., position 3 to 5)
      await Chapter.updateMany(
        {
          cohort: cohortId,
          position: { $gte: currentPosition, $lte: newPosition },
          _id: { $ne: chapterId },
        },
        { $inc: { position: -1 } }
      );
    }

    // Step 5: Update the current chapter's position to the desired newPosition
    chapter.position = newPosition;
    await chapter.save();

    // Step 6: Return the updated chapter
    return chapter;
  } catch (error) {
    throw new Error(`Failed to update chapter position: ${(error as Error).message}`);
  }
},
  async getChaptersByCohort(cohortId: string) {
    return await Chapter.find({
      cohort: cohortId,
      isDeleted: false,
    }).sort({ position: 1 });
  },
  async deleteChapter(chapterId: string) {
    return await Chapter.findByIdAndUpdate(
      chapterId,
      { isDeleted: true },
      { new: true }
    );
  },
   async  getTotalChapters(cohortId: string): Promise<number> {
  return await Chapter.countDocuments({ cohort: cohortId, isDeleted: false });
}
};
