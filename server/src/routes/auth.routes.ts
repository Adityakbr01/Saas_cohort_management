import express from "express";
import { login, register, verifyEmail } from "@/controllers/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, verifyEmailSchema } from "@/utils/zod";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// Public routes
router.post("/register",
    createDynamicRateLimiter({
      timeWindow: 10,
      maxRequests: 4,
    }),
    validateRequest(registerSchema), register);
router.post(
  "/login",
  createDynamicRateLimiter({
    timeWindow: 1, 
    maxRequests: 5,
  }),
  login
);
router.post("/verify-email",
    createDynamicRateLimiter({
      timeWindow: 10,
      maxRequests: 4,
    }),
    validateRequest(verifyEmailSchema), verifyEmail);

// // Refresh token
// router.post("/refresh-token", refreshToken);

// // Protected routes
// router.post("/logout", protect, logout);

export default router;
