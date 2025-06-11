import express from "express";
import { validateRequest } from "@/middleware/validateRequest";
import {
  loginInput,
  resendOtpInput,
  updateProfileInput,
  validateRegisterInput,
  validateRegisterInputcomplate,
} from "@/utils/zod/user";
import { UserController } from "@/controllers/userController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";

const router = express.Router();

/**
 * @openapi
 * /api/user/register/initiate:
 *   post:
 *     summary: Initiate user registration with email & password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInitiateInput'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid input or email already exists
 */
router.post(
  "/register/initiate",
  validateRequest(validateRegisterInput),
  UserController.initiateRegistrationController
);

/**
 * @openapi
 * /api/user/register/complete:
 *   post:
 *     summary: Complete registration using OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterCompleteInput'
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  "/register/complete",
  validateRequest(validateRegisterInputcomplate),
  UserController.complateRegisterController
);

/**
 * @openapi
 * /api/user/resend-otp:
 *   post:
 *     summary: Resend OTP to the user email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpInput'
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 */
router.post(
  "/resend-otp",
  validateRequest(resendOtpInput),
  UserController.resendOTPController
);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     summary: Log in the user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post(
  "/login",
  validateRequest(loginInput),
  UserController.loginController
);

/**
 * @openapi
 * /api/user/all:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get(
  "/all",
  protect,
  restrictTo(Role.super_admin),
  UserController.allUsers
);

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get("/profile", protect, UserController.profile);

/**
 * @openapi
 * /api/user/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch(
  "/profile",
  validateRequest(updateProfileInput),
  protect,
  UserController.updateProfile
);

/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", protect, UserController.logout);

/**
 * @openapi
 * /api/user/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 */
router.delete("/delete", protect, UserController.deleteUser);
router.put("/:userId/role",protect, restrictTo(Role.super_admin), UserController.updateUserRole);
router.post("/initiate-forgot-password", UserController.initiateforgotPassword);
router.post("/complete-forgot-password", UserController.completeforgotPassword);
router.post("/resend-forgot-password-otp", UserController.resendForgotPasswordOtp);


export default router;
