import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
  verifyEmail,
  verifyForgotPassword,
} from "@/controllers/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, verifyEmailSchema } from "@/utils/zod";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";
import { protect } from "@/middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post(
  "/register",
  createDynamicRateLimiter({
    timeWindow: 10,
    maxRequests: 4,
  }),
  validateRequest(registerSchema),
  register
);
router.post(
  "/login",
  createDynamicRateLimiter({
    timeWindow: 1,
    maxRequests: 5,
  }),
  login
);
router.post(
  "/verify-email",
  createDynamicRateLimiter({
    timeWindow: 10,
    maxRequests: 4,
  }),
  validateRequest(verifyEmailSchema),
  verifyEmail
);

// Forgot password routes : todo add zod validation and fronted implementation
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify", verifyForgotPassword);

//todo add zod validation and fronted implementation
// Protected routes with refresh token
router.post("/refresh-token", protect, refreshToken);
router.post("/logout", protect, logout);
router.get("/getProfile", protect, getProfile);
router.post("/password/reset", protect, resetPassword);
router.patch("/updateProfile", protect, updateProfile);

export default router;
