import { AuthController } from "@/controllers/auth.controller";
import { protect } from "@/middleware/authMiddleware";
import { uploadMedia } from "@/middleware/multerConfig";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, verifyEmailSchema } from "@/utils/zod";
import express from "express";
import * as z from "zod";

// Zod schemas for forgot password routes
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

const forgotPasswordVerifySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "Enter the 6-digit OTP"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

const forgotPasswordResendSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const router = express.Router();

// Public routes with stricter rate limiting
router.post(
  "/register",
  createDynamicRateLimiter({
    timeWindow: 1, // 1 minute
    maxRequests: 5,
  }),
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  createDynamicRateLimiter({
    timeWindow: 1, // 1 minute
    maxRequests: 10,
  }),
  AuthController.login
);

router.post(
  "/verify-email",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 4,
  }),
  validateRequest(verifyEmailSchema),
  AuthController.verifyEmail
);

// Forgot password routes with Zod validation and tailored rate limiting
router.post(
  "/forgot-password",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 5,
  }),
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/forgot-password/verify",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 4,
  }),
  validateRequest(forgotPasswordVerifySchema),
  AuthController.verifyForgotPassword
);

router.post(
  "/forgot-password/resend",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 3,
  }),
  validateRequest(forgotPasswordResendSchema),
  AuthController.resendForgotPasswordOTP
);

// Protected routes with more lenient rate limiting
router.post(
  "/refresh-token",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 20,
  }),
  AuthController.refreshToken
);

// ho gya hai test baki hai
router.post(
  "/logout",
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 10,
  }),
  AuthController.logout
);
router.get(
  "/getProfile",
  protect,
  createDynamicRateLimiter({
    timeWindow: 5, // 5 minutes
    maxRequests: 30,
  }),
  AuthController.getProfile
);
router.post(
  "/password/reset",
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 5
  }),
  AuthController.resetPassword
);
router.patch(
  "/updateProfile",
  uploadMedia("media"),
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 10,
  }),
  AuthController.updateProfile
);

export default router;
