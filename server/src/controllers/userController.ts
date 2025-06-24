// import { Request, Response } from "express";
// import { UserService } from "@/services/user.service";
// import { sendError, sendSuccess } from "@/utils/responseUtil";
// import { wrapAsync } from "@/utils/wrapAsync";
// import { logger } from "@/utils/logger";
// import User from "@/models/userModel";
// import { ApiError } from "@/utils/apiError";
// import safeCache from "@/utils/cache";
// import { Role } from "@/configs/roleConfig";
// import { getCookieConfig } from "@/configs/cookieConfig";

// export interface LoginData {
//   email: string;
//   password: string;
// }
// export const UserController = {
//   //Initial Registration
//   initiateRegistrationController: wrapAsync(
//     async (req: Request, res: Response) => {
//       const { email, name } = req.body;
//       const result = await UserService.initiateRegistration({
//         email,
//         name,
//       });
//       if (!result.success) {
//         sendError(res, 400, result.message);
//         return;
//       }
//       sendSuccess(res, 200, result.message);
//     }
//   ),
//   //complate Registration
//   complateRegisterController: wrapAsync(async (req: Request, res: Response) => {
//     const user = await UserService.register(req.body);
//     sendSuccess(res, 201, "User registered successfully", {
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//     safeCache.del("AllUserForAdmin");
//   }),
//   // Resend OTP
//   resendOTPController: wrapAsync(async (req: Request, res: Response) => {
//     try {
//       const { email } = req.body;
//       const result = await UserService.resendOTP(email);
//       sendSuccess(res, 200, result.message, result);
//     } catch (error: any) {
//       logger.error(`Resend OTP failed: ${error.message}`);
//       sendError(res, 400, error.message);
//     }
//   }),
//   // Login Controller
//   loginController: wrapAsync(async (req: Request, res: Response) => {
//     try {
//       const { email, password } = req.body as LoginData;

//       // Basic input validation
//       if (!email || !password) {
//         sendError(res, 400, "Email and password are required");
//         return;
//       }
//       const result = await UserService.loginUser({ email, password });
//       if (!result.success) {
//         sendError(res, 400, result.message);
//         return;
//       }
//       res.cookie("accessToken", result.token, getCookieConfig());
//       res.cookie(
//         "refreshToken",
//         result.refreshToken,
//         getCookieConfig(30 * 24 * 60 * 60 * 1000)
//       );
//       console.log(result);
//       sendSuccess(res, 200, result.message, {
//         result: result.user,
//         token: result.token,
//         refreshToken: result.refreshToken,
//       });
//       return;
//     } catch (error: any) {
//       logger.error(`Login error: ${error.message}`);
//       sendError(res, 400, error.message);
//       return;
//     }
//   }),

//   profile: wrapAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.id;
//     const user = await UserService.getProfile(userId);
//     sendSuccess(res, 200, "User profile fetched", user);
//   }),

//   updateProfile: wrapAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.id;
//     const role = req.user.role
//     const user = await UserService.updateProfile(userId, req.body);
//     sendSuccess(res, 200, "User profile updated", user);
//   }),

//   logout: wrapAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.id;
//     await UserService.logout(userId);
//     res.clearCookie("refreshToken");
//     res.clearCookie("accessToken");
//     sendSuccess(res, 200, "Logged out successfully from all devices");
//   }),

//   //All users for admin panel
//   allUsers: wrapAsync(async (req: Request, res: Response) => {
//     const role = req.user?.role;
//     const userId = req.user?.id;

//     if (role.toString() !== Role.super_admin.toString()) {
//       throw new ApiError(
//         403,
//         "Access denied. Only super_admins can access this route."
//       );
//     }

//     const cached = safeCache.get("AllUserForAdmin");
//     if (cached) {
//       sendSuccess(res, 200, "Users fetched successfully (from cache)", cached);
//       return;
//     }

//     const users = await User.find({
//       $and: [{ _id: { $ne: userId } }, { role: Role.org_admin }],
//     })
//       .select("-password -otp -otpExpiry -refreshTokens -tokenVersion")
//       .populate("plan", "organization");

//     safeCache.set("AllUserForAdmin", users, 600); // Cache for 10 minutes

//     sendSuccess(res, 200, "Users fetched successfully", users);
//   }),

//   // Delete user by ID (for admin)
//   deleteUser: wrapAsync(async (req: Request, res: Response) => {
//     const userId = req.params.id;
//     const { targetId } = req.body;
//     const role = req.user?.role;
//     if (targetId && role.toString() !== Role.org_admin.toString()) {
//     }

//     if (!userId) {
//       sendError(res, 400, "User ID is required");
//       return;
//     }
//     await UserService.deleteUser(userId);
//     safeCache.del("AllUserForAdmin");
//     sendSuccess(res, 200, "User deleted successfully");
//   }),

//   updateUserRole: wrapAsync(async (req: Request, res: Response) => {
//     const userId = req.params.userId;
//     const { role } = req.body;
//     const currentUserRole = req.user?.role;

//     if (currentUserRole !== Role.super_admin) {
//       throw new ApiError(403, "Only super_admins can update user roles");
//     }

//     if (!role) {
//       throw new ApiError(400, "New role is required");
//     }

//     const updatedUser = await UserService.updateUserRole(userId, role);
//     sendSuccess(res, 200, "User role updated successfully", updatedUser);
//   }),

//   initiateforgotPassword: wrapAsync(async (req: Request, res: Response) => {
//     const { email } = req.body;
//     if (!email) {
//       sendError(res, 400, "Email is required");
//       return;
//     }
//     const result = await UserService.initiateForgotPassword(email);
//     if (!result.success) {
//       sendError(res, 400, result.message);
//       return;
//     }
//     sendSuccess(res, 200, result.message);
//   }),

//   completeforgotPassword: wrapAsync(async (req: Request, res: Response) => {
//     const { email, otp, password } = req.body;
//     if (!email || !otp || !password) {
//       sendError(res, 400, "Email, OTP and new password are required");
//       return;
//     }
//     const result = await UserService.completeForgotPassword(
//       email,
//       otp,
//       password
//     );
//     if (!result.success) {
//       sendError(res, 400, result.message);
//       return;
//     }
//     sendSuccess(res, 200, result.message);
//   }),
//   resendForgotPasswordOtp: wrapAsync(async (req: Request, res: Response) => {
//     const { email } = req.body;
//     if (!email) {
//       sendError(res, 400, "Email is required");
//       return;
//     }
//     const result = await UserService.initiateForgotPassword(email);
//     if (!result.success) {
//       sendError(res, 400, result.message);
//       return;
//     }
//     sendSuccess(res, 200, result.message);
//   }),
// };
