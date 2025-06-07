import express from "express";
import { validateRequest } from "@/middleware/validateRequest";
import { validateRegisterInput, validateRegisterInputcomplate } from "@/utils/zod/user";
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
  UserController.complateRegister
);

export default router;
