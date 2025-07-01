import { z } from "zod";

export const createCohortSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string(),
  description: z.string(),
  mentor: z.string(),
  organization: z.string(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
  maxCapacity: z.number(),
  status: z.enum(["active", "upcoming", "completed"]),
  category: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  schedule: z.any(), // adjust as per your structure
  location: z.string().optional(),
  language: z.string(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  certificateAvailable: z.boolean().optional(),
  chapters: z.array(
  z.object({
    title: z.string(),
    totalLessons: z.number(),
    totalDuration: z.number(),
    lessons: z.array(z.string()).optional()
  })
).optional()
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
});