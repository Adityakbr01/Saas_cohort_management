import { Types } from "mongoose";
import { ApiError } from "@/utils/apiError";
import { createUser, findUserByEmail, UserDAO } from "@/dao/user.dao";
import User, { IUser } from "@/models/userModel";
import {
  cleanExpiredOTP,
  generateOTPForPurpose,
  verifyOTP,
} from "@/utils/otpUtils";
import { sendOTPEmail } from "./emailService";
import { logger } from "@/utils/logger";

export const UserService = {
  // Register user - Step 1: Send OTP
  async initiateRegistration(userData: any) {
    try {
      const { email, name, role, organization } = userData;
      const existingUser = await User.findOne({email});
      if (existingUser && existingUser.isVerified) {
        throw new ApiError(409, "User already exists with this email");
      }

      const otpData = generateOTPForPurpose("registration");

      if (existingUser && !existingUser.isVerified) {
        existingUser.otp = otpData.otp;
        existingUser.otpExpiry = otpData.expiry;
        existingUser.name = name;
        await existingUser.save();

        await sendOTPEmail(email, otpData.otp, name);

        logger.info(`OTP resent for ${email}`);
        return {
          success: true,
          message:
            "OTP sent to your email. Please verify to complete registration.",
          userId: existingUser._id.toString(),
        };
      }



      const newUser = UserDAO.createUser({
        email,name,role,organization,password: "temp_password",otp: otpData.otp,otpExpiry: otpData.expiry,
        isVerified: false,
      });

      await sendOTPEmail(email, otpData.otp, name);

      logger.info(`Registration initiated for user: ${email}`);
      return {
        success: true,
        message:
          "OTP sent to your email. Please verify to complete registration."
      };
    } catch (error: any) {
      logger.error(`Registration initiation failed: ${error.message}`);
      throw new ApiError(500, error.message);
    }
  },
  // Complete registration - Step 2: Verify OTP and set password
  async register(data: Partial<IUser>) {
    const { email, password, organization, otp } = data;

    if (!otp || !password) {
      throw new ApiError(400, "OTP and password are required.");
    }

    const existingUser = await UserDAO.findByEmailWithPassword(email!);
    if (!existingUser) {
      throw new ApiError(404, "User not found.");
    }

    if (existingUser.isVerified) {
      throw new ApiError(409, "User is already verified.");
    }

    cleanExpiredOTP(existingUser); // This should throw if expired

    const otpResult = verifyOTP(otp as string, existingUser.otp!, existingUser.otpExpiry!);
    if (!otpResult.isValid) {
      throw new ApiError(400, otpResult.error!);
    }

    existingUser.password = password;
    existingUser.isVerified = true;
    existingUser.organization = organization ? new Types.ObjectId(organization) : existingUser.organization;
    existingUser.otp = undefined;
    existingUser.otpExpiry = undefined;

    await existingUser.save(); // This will hash the password due to pre('save')

    return existingUser;
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    const user = await UserDAO.findByEmailWithPassword(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async getProfile(userId: string) {
    const user = await UserDAO.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async updateProfile(userId: string, update: Partial<IUser>) {
    return await UserDAO.updateUser(userId, update);
  },

  async logout(userId: string) {
    await UserDAO.invalidateTokens(userId);
  },
};
