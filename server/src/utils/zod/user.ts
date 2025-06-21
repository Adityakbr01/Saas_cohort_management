// utils/zod/user.ts

import { z } from "zod";

export const validateRegisterInput = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const validateRegisterInputcomplate = z.object({
  otp: z.string().min(4, { message: "Otp are required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
});

export const resendOtpInput = z.object({
  email: z.string().email({ message: "Please provide a valid email" }),
});

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileInput = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters" })
    .optional(),
  goals: z
    .string()
    .min(10, { message: "Goals must be at least 10 characters" })
    .optional(),
  background: z
    .object({
      education: z.string().min(10).optional(),
      experience: z.string().min(10).optional(),
      learningGoals: z.string().min(10).optional(),
      skills: z
        .array(
          z.object({
            name: z.string(),
            progress: z.number().min(0).max(100),
          })
        )
        .optional(),
    })
    .optional(),
  skills: z
    .array(
      z.object({
        name: z.string(),
        progress: z.number().min(0).max(100),
      })
    )
    .optional(),
});
