// utils/zod/user.ts

import { z } from "zod";

export const validateRegisterInput = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  role: z.enum(["super_admin", "mentor", "student", "org_admin"]).optional(),
  organization: z.string().optional(),
});


export const validateRegisterInputcomplate = z.object({
  otp:z.string().min(4,{message:"Otp are required"}),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
   email: z.string().email({ message: "Invalid email address" }),
})


export const resendOtpInput = z.object({
  email: z.string().email({ message: "Please provide a valid email" }),
});


export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});