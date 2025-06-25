import express from "express";
import { getProfile, login, logout, refreshToken, register, verifyEmail } from "@/controllers/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, verifyEmailSchema } from "@/utils/zod";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";
import { protect } from "@/middleware/authMiddleware";

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






//router.post("/forgot-password", forgotPassword);
//router.post("/forgot-password/verify", verifyForgotPassword);

// Protected routes with refresh token
router.post("/refresh-token",protect, refreshToken);
router.post("/logout", protect, logout);
//router.patch("/updateProfile", updateProfile);
router.get("/getProfile",protect, getProfile);

//router.post("/password/reset", resetPassword);
//router.post("/password/reset/verify", verifyResetPassword);


export default router;
