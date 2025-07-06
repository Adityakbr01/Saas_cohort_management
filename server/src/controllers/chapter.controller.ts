// ✅ controllers/chapter.controller.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { ChapterService } from "@/services/chapter.service";
import mongoose from "mongoose";

export const ChapterController = {
  // ✅ Create Chapter under a Cohort
  createChapterUnderCohort: asyncHandler(
    async (req: Request, res: Response) => {
      const cohortId = req.params.cohortId;
      const chapterData = req.body;
      const userId = req.user?.id;

      const chapter = await ChapterService.createChapter(
        cohortId,
        chapterData,
        userId
      );
      sendSuccess(res, 201, "Chapter created successfully", chapter);
    }
  ),

  // ✅ Update Chapter
  updateChapter: asyncHandler(async (req: Request, res: Response) => {
    const chapterId = req.params.chapterId;
    const cohortId = req.params.cohortId;
    const updates = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    const updated = await ChapterService.updateChapter({
      chapterId,
      cohortId,
      updates,
      userId,
      userRole: role,
    });

    if (!updated) {
      sendError(res, 404, "Chapter not found");
      return;
    }

    sendSuccess(res, 200, "Chapter updated successfully", updated);
  }),

    // ✅ Update Chapter Position
  updateChapterPosition: asyncHandler(async (req: Request, res: Response) => {
    const chapterId = req.params.chapterId;
    const { cohortId, newPosition } = req.body;

    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      sendError(res, 400, "Invalid chapter ID");
      return;
    }

    if (!cohortId || !mongoose.Types.ObjectId.isValid(cohortId)) {
      sendError(res, 400, "Invalid cohort ID");
      return;
    }

    if (typeof newPosition !== "number" || newPosition < 1) {
      sendError(res, 400, "New position must be a valid number");
      return;
    }

    // Check if newPosition is within valid range
  const totalChapters = await ChapterService.getTotalChapters(cohortId);
  if (newPosition > totalChapters + 1) {
    sendError(res, 400, `New position cannot exceed ${totalChapters + 1}`);
    return;
  }

  const updated = await ChapterService.updateChapterPosition({
    chapterId,
    cohortId,
    newPosition,
  });

  sendSuccess(res, 200, "Chapter position updated successfully", updated);
  }),

  // ✅ Get Chapters By Cohort
  getChaptersByCohort: asyncHandler(async (req: Request, res: Response) => {
    const cohortId = req.params.cohortId;
    const chapters = await ChapterService.getChaptersByCohort(cohortId);
    sendSuccess(res, 200, "Chapters fetched successfully", chapters);
  }),

  // ✅ Delete Chapter
  deleteChapter: asyncHandler(async (req: Request, res: Response) => {
    const chapterId = req.params.chapterId;
    const deleted = await ChapterService.deleteChapter(chapterId);

    if (!deleted) {
      sendError(res, 404, "Chapter not found");
      return;
    }
    sendSuccess(res, 200, "Chapter deleted successfully", deleted);
  }),
};
