import { z } from "zod";

// ✅ Correct createLessonSchema ✅
export const createLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  shortDescription: z.string().min(5, "Description must be at least 5 characters"),

  duration: z.preprocess((val) => Number(val), z.number().min(0, "Duration must be a non-negative number")),

  contentType: z.enum(["video", "text", "interactive"], {
    message: "Content type must be video, text, or interactive"
  }),

  videoUrl: z.string().url().optional(),

  isPrivate: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).optional(),

  isPremium: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).optional(),

  status: z.enum(["upcoming", "inProgress", "completed"]).default("upcoming"),

  position: z.preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().optional()),

  Thumbnail: z.string().optional(),
  demoVideo: z.string().optional(),
});

// ✅ Correct updateLessonSchema ✅
export const updateLessonSchema = z.object({
    title: z.string().min(3).optional(), 
    shortDescription: z.string().min(5).optional(),
    duration: z.number().min(0).optional(), 
    contentType: z.enum(["video", "text", "interactive"]).optional(),
    position: z.number().optional(),
    Thumbnail: z.string().optional(), 
    isPremium: z.boolean().optional(), 
    demoVideo: z.string().optional(),
});













