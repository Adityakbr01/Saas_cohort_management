import { getCookieConfig } from "@/configs/cookieConfig";
import { ApiError } from "@/utils/apiError";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { ResendOTPBody } from "@/utils/zod";
import { Request, Response } from "express";


import { authService } from "@/services/auth.service";

export interface RegisterBody {
  email: string;
  password: string;
  role: "mentor" | "student" | "organization" | "super_admin";
  name: string;
  phone?: string;
  slug?: string;
  specialization?: string;
  experience?: string;
  yearsOfExperience?: number;
  skillsExpertise?: string[];
  adminPrivileges?: string[];
}

interface VerifyEmailBody {
  email: string;
  otp: string;
  role: "mentor" | "student" | "organization" | "super_admin";
}

interface LoginBody {
  email: string;
  password: string;
  role: "mentor" | "student" | "organization" | "super_admin";
}

export const AuthController = {
  register: wrapAsync(async (req: Request, res: Response) => {
    const {
      email,
      password,
      role,
      name,
      phone,
      slug,
      specialization,
      experience,
      yearsOfExperience,
      skillsExpertise,
      adminPrivileges,
    }: RegisterBody = req.body;

    if (!email || !password || !role || !name) {
      sendError(res, 400, "Please provide email, password, role, and name");
      return;
    }

    const { user, accessToken, refreshToken } = await authService.register({
      email,
      password,
      role,
      name,
      phone,
      slug,
      specialization,
      experience,
      yearsOfExperience,
      skillsExpertise,
      adminPrivileges,
    });

    sendSuccess(res, 201, "User registered successfully", {
      result: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
      },
      token: accessToken,
      refreshToken,
    });
  }),

  verifyEmail: wrapAsync(async (req: Request, res: Response) => {
    const { email, otp, role }: VerifyEmailBody = req.body;

    if (!email || !otp || !role) {
      sendError(res, 400, "Please provide email, otp, and role");
      return;
    }

    await authService.verifyEmail(email, otp, role);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  }),
  resendOTP: wrapAsync(async (req: Request, res: Response) => {
    // Validation is handled by validateRequest middleware
    const { email, role } = req.body as ResendOTPBody;

    await authService.resendOTP(role, email);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email for verification",
    });
  }),
  login: wrapAsync(async (req: Request, res: Response) => {
    const { email, password, role }: LoginBody = req.body;

    if (!email || !password || !role) {
      sendError(res, 400, "Please provide email, password, and role");
      return;
    }

    const loginResult = await authService.login(email, password, role);
    if (!loginResult) {
      sendError(res, 500, "Login failed");
      return;
    }

    const { accessToken, refreshToken, user } = loginResult;

    res.cookie("accessToken", accessToken, getCookieConfig());
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieConfig(30 * 24 * 60 * 60 * 1000)
    );

    res.cookie("accessToken", accessToken, getCookieConfig()); // 12 hours
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieConfig(30 * 24 * 60 * 60 * 1000) // 30 days
    );

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      },
    });
  }),
  getProfile: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    const user = await authService.getProfile(userId, role);

    res.status(200).json({
      status: "success",
      data: user,
    });
    sendSuccess(res, 200, "success", { data: user });
  }),
  logout: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    await authService.logout(userId, role);

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      status: "success",
      message: "Logged out successfully from all devices",
    });
  }),
  refreshToken: wrapAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    console.log(refreshToken);

    if (!refreshToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const accessToken = await authService.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, getCookieConfig());
    res.status(200).json({
      status: "success",
      data: { accessToken },
    });
  }),
  forgotPassword: wrapAsync(async (req: Request, res: Response) => {
    const { email, role }: { email: string; role: string } = req.body;

    console.log(req.body);

    if (!email || !role) {
      sendError(res, 400, "Email and role are required");
      return;
    }

    await authService.forgotPassword(email, role);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email for password reset",
    });
  }),
  verifyForgotPassword: wrapAsync(async (req: Request, res: Response) => {
    const {
      email,
      otp,
      role,
      password,
    }: { email: string; otp: string; role: string; password: string } =
      req.body;

    if (!email || !otp || !role || !password) {
      sendError(res, 400, "Email, OTP, and role are required");
      return;
    }

    await authService.verifyForgotPassword(email, otp, password, role);
    sendSuccess(res, 200, "Password reset successfully", {
      message: "Password reset successfully",
    });
  }),
  resendForgotPasswordOTP: wrapAsync(async (req: Request, res: Response) => {
    const { email, role }: { email: string; role: string } = req.body;

    console.log("[DEBUG] Request body:", req.body);

    if (!email || !role) {
      sendError(res, 400, "Email and role are required");
      return;
    }

    await authService.resendForgotPasswordOTP(email, role);

    sendSuccess(res, 200, "OTP sent to your email for password reset");
  }),
  resetPassword: wrapAsync(async (req: Request, res: Response) => {
    const { password }: { password: string } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      sendError(res, 400, "User ID and role are required");
      return;
    }

    if (!password) {
      sendError(res, 400, "Password is required");
      return;
    }

    await authService.resetPassword(userId, userRole, password);

    sendSuccess(res, 200, "Password reset successfully");
  }),
   updateProfile: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
       sendError(res, 400, "User ID and role are required");
       return
    }
    const result = await authService.updateProfile({
      userId,
      userRole,
      body: req.body,
      file: req.file,
    });
     sendSuccess(res, 200, "Profile updated successfully", result);
     return
  }),
};
