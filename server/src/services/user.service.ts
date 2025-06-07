import { LoginData } from "@/controllers/userController";
import { UserDAO } from "@/dao/user.dao";
import User, { IUser } from "@/models/userModel";
import { ApiError } from "@/utils/apiError";
import { logger } from "@/utils/logger";
import {
  cleanExpiredOTP,
  generateOTPForPurpose,
  verifyOTP,
} from "@/utils/otpUtils";
import { Types } from "mongoose";
import { sendOTPEmail } from "./emailService";

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
// Resend OTP for verification
async resendOTP (email: string): Promise<any> {
  try {
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
      throw new ApiError(409, "User is already verified");
    }

    const otpData = generateOTPForPurpose("verification");
    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendOTPEmail(email, otpData.otp, user.name);

    logger.info(`OTP resent for user: ${email}`);
    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error: any) {
    logger.error(`OTP resend failed: ${error.message}`);
    throw error;
  }
},

async loginUser (loginData: LoginData): Promise<any> {
  try {
    const { email, password } = loginData;

    const user = await UserDAO.findByEmailWithPassword(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "Please verify your email before logging in");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account has been deactivated. Please contact support");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Log current tokenVersion before invalidation
    logger.info(`User ${email} - Current tokenVersion: ${user.tokenVersion}`);

    // Invalidate all previous tokens for single device login
    await UserDAO.invalidateAllTokens(user._id.toString());

    // Fetch user again to get updated tokenVersion
    const updatedUser = await UserDAO.findById(user._id.toString());
    if (!updatedUser) {
      throw new ApiError(500, "User not found after token invalidation");
    }

    // Log new tokenVersion
    logger.info(`User ${email} - New tokenVersion: ${updatedUser.tokenVersion}`);

    const token = updatedUser.generateAuthToken();
    const refreshToken = updatedUser.generateRefreshToken();

    // Store refresh token in the database
    await UserDAO.storeRefreshToken(updatedUser._id.toString(), refreshToken);

    // Update last login
    await UserDAO.updateUser(updatedUser._id.toString(), { lastLogin: new Date() });

    // Fetch user again to confirm refresh token storage
    const finalUser = await UserDAO.findById(updatedUser._id.toString());
    if (!finalUser) {
      throw new ApiError(500, "User not found after updates");
    }

    logger.info(
      `User logged in: ${email}, Refresh tokens count: ${finalUser.refreshTokens.length}`
    );

    return {
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: finalUser._id.toString(),
        email: finalUser.email,
        name:finalUser.name,
        role: finalUser.role,
        isVerified: finalUser.isVerified,
        lastLogin: finalUser.lastLogin || new Date(),
      },
    };
  } catch (error: any) {
    logger.error(`Login failed for ${loginData.email}: ${error.message}`);
    throw new ApiError(401, error.message);
  }
},

  async getProfile(userId: string) {
    const user = await UserDAO.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async updateProfile(userId: string, update: Partial<IUser>) {
    console.log(update)
    return await UserDAO.updateUser(userId, update);
  },

  async logout(userId: string) {
    await UserDAO.invalidateAllTokens(userId);
  },
};
