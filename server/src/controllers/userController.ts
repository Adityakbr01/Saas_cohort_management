import { Request, Response } from "express";
import { UserService } from "@/services/user.service";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { logger } from "@/utils/logger";
import { cookieConfig } from "@/configs/cookieConfig";

export interface LoginData {
  email: string;
  password: string;
}
export const UserController = {
  //Initial Registration
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
  //complate Registration
  complateRegisterController: wrapAsync(async (req: Request, res: Response) => {
    const user = await UserService.register(req.body);
    sendSuccess(res, 201, "User registered successfully", user);
  }),
  // Resend OTP
  resendOTPController: wrapAsync(async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await UserService.resendOTP(email);
      sendSuccess(res, 200, result.message, result);
    } catch (error: any) {
      logger.error(`Resend OTP failed: ${error.message}`);
      sendError(res, 400, error.message);
    }
  }),
  // Login Controller
  loginController: wrapAsync(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginData;

      // Basic input validation
      if (!email || !password) {
        sendError(res, 400, "Email and password are required");
        return;
      }
      const result = await UserService.loginUser({ email, password });
      if (!result.success) {
        sendError(res, 400, result.message);
        return;
      }
      res.cookie("accessToken", result.token, cookieConfig);
      res.cookie("refreshToken", result.refreshToken, cookieConfig);
      sendSuccess(res, 200, result.message, result);
      return;
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      sendError(res, 400, error.message);
      return;
    }
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
