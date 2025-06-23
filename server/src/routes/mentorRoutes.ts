import express from "express";
const router  = express.Router();

import { validateRequest } from "@/middleware/validateRequest";
import {
  loginInput,
  resendOtpInput,
  updateProfileInput,
  validateRegisterInput,
  validateRegisterInputcomplate,
} from "@/utils/zod/user";
import { MentorController } from "@/controllers/mentorController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

//Done ✅ --> todo add zod for inputs
// Registration and Authentication
router.post(
  "/register/initiate",
  createDynamicRateLimiter({
    timeWindow: 10,// 10 minutes
    maxRequests: 4, // Limit to 4 requests per 10 minutes
  }),
  MentorController.initiateRegistrationController
);

//Done ✅ --> todo add zod for inputs
router.post(
  "/register/complete",
  MentorController.complateRegisterController
);

router.post(
  "/resend-otp",
  createDynamicRateLimiter({
    timeWindow: 10,
    maxRequests: 3,
  }),
  validateRequest(resendOtpInput),
  MentorController.resendOTPController
);

router.post(
  "/login",
  validateRequest(loginInput),
  MentorController.loginController
);

// Profile Management
router.get(
  "/profile", 
  protect, 
  MentorController.profile
);

router.patch(
  "/profile",
  validateRequest(updateProfileInput),
  protect,
  MentorController.updateProfile
);

router.delete(
  "/delete", 
  protect, 
  MentorController.deleteUser
);

// Session Management
router.post(
  "/logout", 
  protect, 
  MentorController.logout
);

// router.get(
//   "/refresh-token", 
//   MentorController.refreshAccessToken
// );

// Password Management
router.post(
  "/initiate-forgot-password",
  createDynamicRateLimiter({
    timeWindow: 1,
    maxRequests: 5,
  }),
  MentorController.initiateforgotPassword
);

router.post(
  "/complete-forgot-password", 
  MentorController.completeforgotPassword
);

router.post(
  "/resend-forgot-password-otp",
  createDynamicRateLimiter({
    timeWindow: 10,
    maxRequests: 4,
  }),
  MentorController.resendForgotPasswordOtp
);



export default router;
