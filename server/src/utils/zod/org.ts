// backend/schemas/orgSchema.ts
import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  logo: z
    .custom<Express.Multer.File>(
      (val) => val === undefined || val instanceof File,
      {
        message: "Logo must be a file or undefined",
      }
    )
    .optional()
    .refine((file) => !file || file.mimetype.startsWith("image/"), {
      message: "Logo must be an image file",
    }),
});

export const inviteMentorSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  specialization: z.string().min(1, { message: "Specialization is required" }),
  experience: z.string().min(1, { message: "Experience is required" }),
  bio: z.string().min(1, { message: "Bio is required" }),
  certifications: z.string().min(1, { message: "Certifications are required" }),
  role: z.enum(["mentor", "student"]).optional(),
});
