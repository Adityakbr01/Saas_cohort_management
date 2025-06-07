import express from "express";
import { validateRequest } from "@/middleware/validateRequest";
import {
  loginInput,
  resendOtpInput,
  validateRegisterInput,
  validateRegisterInputcomplate,
} from "@/utils/zod/user";
import { UserController } from "@/controllers/userController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";

const router = express.Router();

router.post(
  "/register/initiate",
  validateRequest(validateRegisterInput),
  UserController.initiateRegistrationController
);
router.post(
  "/register/complete",
  validateRequest(validateRegisterInputcomplate),
  UserController.complateRegisterController
);
router.post(
  "/resend-otp",
  validateRequest(resendOtpInput),
  UserController.resendOTPController
);
router.post(
  "/login",
  validateRequest(loginInput),
  UserController.loginController
);
router.get(
  "/all",
  protect,
  restrictTo(Role.org_admin),
  UserController.allUsers
);
router.get("/profile", protect, UserController.profile);
router.patch("/profile", protect, UserController.updateProfile);
router.post("/logout", protect, UserController.logout);

export default router;
