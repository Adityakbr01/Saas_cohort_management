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
    keyGenerator: (req) => `${req.ip}:register`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for register from IP: ${req.ip}`
      );
      res.status(429).json({
        status: "error",
        message: "Too many registration attempts. Please try again later.",
      });
    },
  }),
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  createDynamicRateLimiter({
    timeWindow: 1, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => `${req.ip}:login`,
    onLimitExceeded: (req, res) => {
      console.log(`[DEBUG] Rate limit exceeded for login from IP: ${req.ip}`);
      res.status(429).json({
        status: "error",
        message: "Too many login attempts. Please try again later.",
      });
    },
  }),
  AuthController.login
);

router.post(
  "/verify-email",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 4,
    keyGenerator: (req) => `${req.ip}:verify-email`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for verify-email from IP: ${req.ip}`
      );
      res.status(429).json({
        status: "error",
        message:
          "Too many email verification attempts. Please try again later.",
      });
    },
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
    keyGenerator: (req) => `${req.ip}:forgot-password`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for forgot-password from IP: ${req.ip}`
      );
      res.status(429).json({
        status: "error",
        message: "Too many password reset requests. Please try again later.",
      });
    },
  }),
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/forgot-password/verify",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 4,
    keyGenerator: (req) => `${req.ip}:forgot-password-verify`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for forgot-password/verify from IP: ${req.ip}`
      );
      res.status(429).json({
        status: "error",
        message: "Too many OTP verification attempts. Please try again later.",
      });
    },
  }),
  validateRequest(forgotPasswordVerifySchema),
  AuthController.verifyForgotPassword
);

router.post(
  "/forgot-password/resend",
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 3,
    keyGenerator: (req) => `${req.ip}:forgot-password-resend`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for forgot-password/resend from IP: ${req.ip}`
      );
      res.status(429).json({
        status: "error",
        message: "Too many OTP resend requests. Please try again later.",
      });
    },
  }),
  validateRequest(forgotPasswordResendSchema),
  AuthController.resendForgotPasswordOTP
);

// Protected routes with more lenient rate limiting
router.post(
  "/refresh-token",
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 20,
    keyGenerator: (req) => `${req.user?.id || "unknown_user"}:refresh-token`, // Fallback to avoid undefined
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for refresh-token for user: ${
          req.user?.id || "unknown_user"
        }`
      );
      res.status(429).json({
        status: "error",
        message: "Too many token refresh attempts. Please try again later.",
      });
    },
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
    keyGenerator: (req) => `${req.user?.id || "unknown_user"}:logout`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for logout for user: ${
          req.user?.id || "unknown_user"
        }`
      );
      res.status(429).json({
        status: "error",
        message: "Too many logout attempts. Please try again later.",
      });
    },
  }),
  AuthController.logout
);
router.get(
  "/getProfile",
  protect,
  createDynamicRateLimiter({
    timeWindow: 5, // 5 minutes
    maxRequests: 30,
    keyGenerator: (req) => `${req.user?.id || "unknown_user"}:getProfile`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for getProfile for user: ${
          req.user?.id || "unknown_user"
        }`
      );
      res.status(429).json({
        status: "error",
        message: "Too many profile requests. Please try again later.",
      });
    },
  }),
  AuthController.getProfile
);
router.post(
  "/password/reset",
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 5,
    keyGenerator: (req) => `${req.user?.id || "unknown_user"}:password-reset`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for password/reset for user: ${
          req.user?.id || "unknown_user"
        }`
      );
      res.status(429).json({
        status: "error",
        message: "Too many password reset attempts. Please try again later.",
      });
    },
  }),
  resetPassword
);
router.patch(
  "/updateProfile",
  uploadMedia("media"),
  protect,
  createDynamicRateLimiter({
    timeWindow: 10, // 10 minutes
    maxRequests: 10,
    keyGenerator: (req) => `${req.user?.id || "unknown_user"}:updateProfile`,
    onLimitExceeded: (req, res) => {
      console.log(
        `[DEBUG] Rate limit exceeded for updateProfile for user: ${
          req.user?.id || "unknown_user"
        }`
      );
      res.status(429).json({
        status: "error",
        message: "Too many profile update attempts. Please try again later.",
      });
    },
  }),
  AuthController.updateProfile
);

export default router;
