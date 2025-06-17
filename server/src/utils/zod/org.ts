// backend/schemas/orgSchema.ts
import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  logo: z
    .custom<Express.Multer.File>((val) => val === undefined || val instanceof File, {
      message: "Logo must be a file or undefined",
    })
    .optional()
    .refine(
      (file) => !file || file.mimetype.startsWith("image/"),
      { message: "Logo must be an image file" }
    ),
});