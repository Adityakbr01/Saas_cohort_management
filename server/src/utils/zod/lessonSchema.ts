import { z } from "zod";


// ✅ Correct and complete createLessonSchema ✅
export const createLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  shortDescription: z.string().min(5, "Description must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().min(0, "Duration must be 0 or more"),
  contentType: z.enum(["video", "reading", "quiz", "assignment", "project"], {
    message: "Content type must be video, reading, quiz, assignment, or project",
  }),
  videoUrl: z.string().url().optional(),

  isPrivate: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),

  isPremium: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  dueDate: z.coerce.date().optional(),

  status: z.enum(["upcoming", "inProgress", "completed"]).default("upcoming"),

  position: z
    .preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number())
    .optional(),

  Thumbnail: z.string().optional(),
  demoVideo: z.string().optional(),
});


export const CodeDataSchema = z.object({
  language: z.enum([
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "ruby",
    "php",
    "csharp",
    "go",
    "rust",
  ], {
    errorMap: () => ({ message: "Invalid programming language" }),
  }),
  code: z.string().min(1, "Code is required").max(10000, "Code is too long"),
  description: z.string().max(1000, "Description is too long").optional().default(""),
  isStarter: z.boolean().default(false),
  isSolution: z.boolean().default(false),
  version: z.number().min(1, "Version must be at least 1").default(1),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  runLink: z.string().url("Invalid URL format").optional().default(""),
  level: z.enum(["easy", "medium", "hard"]).default("easy"),
});

// ✅ Correct updateLessonSchema ✅
export const updateLessonSchema = z.object({
  title: z.string().min(3).optional(),
  shortDescription: z.string().min(5).optional(),
  contentType: z.enum(["video", "reading", "quiz", "assignment", "project"]).optional(),
  position: z.number().optional(),
  Thumbnail: z.string().optional(),
  isPremium: z.boolean().optional(),
  demoVideo: z.string().optional(),
  
});













