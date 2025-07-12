import { z } from "zod";

export const createCohortSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  mentor: z.string().min(1, "Mentor ID is required"),
  organization: z.string().min(1, "Organization ID is required"),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date"),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid end date"),
  maxCapacity: z.number().min(1, "Maximum capacity must be a positive number") || z.string().min(1, "Maximum capacity must be a positive number"),
  status: z.enum(["active", "upcoming", "completed"], {
    message: "Status must be active, upcoming, or completed",
  }),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Difficulty must be Beginner, Intermediate, or Advanced",
  }),
  schedule: z.any(),
  location: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  certificateAvailable: z.boolean().optional(),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        totalLessons: z.number(),
        totalDuration: z.number(),
        lessons: z.array(z.string()).optional(),
      })
    )
    .optional(),
  thumbnail: z.string().optional(),
  demoVideo: z.string().optional(),
  createdBy: z.string().optional(), // Added to allow createdBy from controller
  duration: z.number().optional(),
  price: z.number() || z.number().optional(),
  originalPrice: z.number() || z.number().optional(),
  discount: z.number() || z.number().optional(),
  isPrivate: z.boolean().optional(),
 limitedTimeOffer: z.object({
  isActive: z.boolean().optional(),
  startDate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  endDate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
}).optional()
});

export const updateCohortSchema = z.object({
  title: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  mentor: z.string().optional(),
  organization: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxCapacity: z.number().optional(),
  status: z.enum(["active", "completed", "upcoming"]).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  schedule: z.string().optional(),
  location: z.string().optional(),
  progress: z.number().optional(),
  completionRate: z.number().optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  certificateAvailable: z.boolean().optional(),
  chapters: z.array(z.string()).optional(),
  duration: z.string().optional(),
  price: z.number() || z.string().optional(),
  originalPrice: z.number() || z.string().optional(),
  discount: z.number() || z.number().optional(),
  isPrivate: z.boolean().optional(),
});
