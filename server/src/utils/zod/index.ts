import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Base schema for common fields across all roles
const baseSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email")
    .transform((val) => sanitizeHtml(val)),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
 role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  name: z
    .string()
    .min(1, "Name is required")
    .transform((val) => sanitizeHtml(val)),
  logo: z
    .any()
    .optional()
    .refine(
      (file) =>
        !file ||
        (typeof file === "object" &&
          file?.mimetype &&
          ["image/jpeg", "image/png", "image/svg+xml"].includes(file.mimetype)),
      { message: "Logo must be a JPEG, PNG, or SVG image" }
    ),
});

// Mentor-specific schema
const mentorSchema = baseSchema.extend({
  role: z.literal("mentor"),
  phone: z
    .string()
    .min(1, "Phone is required for mentors")
    .transform((val) => sanitizeHtml(val)),
  specialization: z
    .string()
    .min(1, "Specialization is required for mentors")
    .transform((val) => sanitizeHtml(val)),
  experience: z
    .string()
    .min(1, "Experience is required for mentors")
    .transform((val) => sanitizeHtml(val)),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience must be a non-negative number"),
  skillsExpertise: z
    .array(z.string().min(1, "Each skill must be non-empty"))
    .min(1, "Skills expertise must be a non-empty array")
    .transform((arr) => arr.map((val) => sanitizeHtml(val))),
});

// Student-specific schema
const studentSchema = baseSchema.extend({
  role: z.literal("student"),
  phone: z
    .string()
    .min(1, "Phone is required for students")
    .transform((val) => sanitizeHtml(val)),
});

// Organization-specific schema
const organizationSchema = baseSchema.extend({
  role: z.literal("organization"),
  slug: z
    .string()
    .min(1, "Slug is required for organizations")
    .transform((val) => sanitizeHtml(val)),
});

// superAdmin-specific schema
const superAdminSchema = baseSchema.extend({
  role: z.literal("super_admin"),
  adminPrivileges: z
    .array(z.enum(["manage_users", "manage_cohorts", "view_analytics", "manage_billing"]))
    .min(1, "At least one admin privilege is required")
    .default(["manage_users", "manage_cohorts"]),
});

// Union schema for all roles
export const registerSchema = z.discriminatedUnion("role", [
  mentorSchema,
  studentSchema,
  organizationSchema,
  superAdminSchema,
]);


// OTP verification schema (used separately)
export const verifyEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().min(4, { message: "Otp is required" }),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

// OTP resend schema (used separately)
export const resendOTPSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email")
    .transform((val) => sanitizeHtml(val)),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export type ResendOTPBody = z.infer<typeof resendOTPSchema>;


// Inferred TypeScript type
export type RegisterBody = z.infer<typeof registerSchema>;
