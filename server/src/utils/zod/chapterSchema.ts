import { z } from "zod";

export const createChapterSchema = z.object({
    title: z.string().min(3),
    shortDescription: z.string().min(5),
    totalLessons: z.number().min(0),
    totalDuration: z.number().min(0),
    Thumbnail: z.string().optional(),
    isPrivate: z.boolean().optional(),
    position: z.number().optional()
});

export const updateChapterSchema = z.object({
    title: z.string().optional(),
    shortDescription: z.string().optional(),
    totalLessons: z.number().optional(),
    totalDuration: z.number().optional(),
    Thumbnail: z.string().optional(),
    isPrivate: z.boolean().optional(),
    position: z.number().optional(),
    status: z.enum(["upcoming", "inProgress", "completed"]).optional(),
  });
