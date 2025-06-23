import express from "express";
import { login, register, verifyEmail } from "@/controllers/auth.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, verifyEmailSchema } from "@/utils/zod";

const router = express.Router();

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", login);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);

// // Refresh token
// router.post("/refresh-token", refreshToken);

// // Protected routes
// router.post("/logout", protect, logout);

export default router;
