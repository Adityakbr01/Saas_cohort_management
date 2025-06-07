import express from "express";
import { validateRequest } from "@/middleware/validateRequest";
import {
  loginInput,
  resendOtpInput,
  validateRegisterInput,
  validateRegisterInputcomplate,
} from "@/utils/zod/user";
import { UserController } from "@/controllers/userController";

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

export default router;
