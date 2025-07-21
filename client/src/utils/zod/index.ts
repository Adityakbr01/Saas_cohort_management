import * as z from "zod";

export const LectureSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 4 characters"),
  contentType: z.enum(["video", "text", "interactive"]),
  status: z.enum(["upcoming", "inProgress", "completed"]),
  position: z.string(),
  video: z.any().optional(),
});

export const EditSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters"),
  shortDescription: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["upcoming", "inProgress", "completed"]),
  contentType: z
    .enum(["video", "assignment", "project", "reading", "link"])
    .optional(),
});


export const ChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(5, "Description must be at least 5 characters"),
  cohortId: z.string().min(1, "Cohort ID is required"),
  totalLessons: z.number().min(0, "Total lessons must be 0 or more"),
  totalDuration: z.number().min(0, "Total duration must be 0 or more"),
});
