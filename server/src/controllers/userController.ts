import { Request, Response } from "express";
import { UserService } from "@/services/user.service";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { logger } from "@/utils/logger";

export const UserController = {
  initiateRegistrationController: wrapAsync(
    async (req: Request, res: Response) => {
      const { email, name } = req.body;
      const result = await UserService.initiateRegistration({
        email,
        name,
      });
      if (!result.success) {
        sendError(res, 400, result.message);
        return;
      }
      sendSuccess(res, 200, result.message);
    }
  ),

  complateRegisterController: wrapAsync(async (req: Request, res: Response) => {
    const user = await UserService.register(req.body);
    sendSuccess(res, 201, "User registered successfully", user);
  }),

  // Resend OTP
 resendOTPController : wrapAsync(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await UserService.resendOTP(email);
    sendSuccess(res, 200, result.message, result);
  } catch (error: any) {
    logger.error(`Resend OTP failed: ${error.message}`);
    sendError(res, 400, error.message);
  }
}),

  login: wrapAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    // Optionally, set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendSuccess(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  }),

  profile: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await UserService.getProfile(userId);
    sendSuccess(res, 200, "User profile fetched", user);
  }),

  updateProfile: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await UserService.updateProfile(userId, req.body);
    sendSuccess(res, 200, "User profile updated", user);
  }),

  logout: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await UserService.logout(userId);
    res.clearCookie("refreshToken");
    sendSuccess(res, 200, "Logged out successfully from all devices");
  }),
};
