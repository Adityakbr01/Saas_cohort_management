import { Request, Response } from "express";
import Mentor, { IMentor } from "../models/mentor.model";
import Student, { IStudent } from "../models/student.model";
import Organization, { IOrganization } from "../models/organization.model";
// import { AppError, catchAsync } from "../utils/error";
import { ApiError } from "@/utils/apiError";
import { wrapAsync } from "@/utils/wrapAsync";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { generateOTPForPurpose } from "@/utils/otpUtils";
import { getUserByRole } from "@/utils/modelUtils";
import { sendForgotPasswordEmail, sendOTPEmail } from "@/services/emailService";
import { logger } from "@/utils/logger";
import { ResendOTPBody } from "@/utils/zod";
import SuperAdmin, { ISuperAdmin } from "@/models/superAdmin.model";
import { getCookieConfig } from "@/configs/cookieConfig";

import jwt from "jsonwebtoken";
import safeCache from "@/utils/cache";
import { deleteFile, uploadImage } from "@/services/cloudinaryService";

import FileModel from "@/models/file.model";

interface RegisterBody {
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

export const register = wrapAsync(async (req: Request, res: Response) => {
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

  // Check if email already exists
  let existingUser: IMentor | IStudent | IOrganization | ISuperAdmin | null;
  switch (role) {
    case "mentor":
      existingUser = await Mentor.findOne({ email });
      break;
    case "student":
      existingUser = await Student.findOne({ email });
      break;
    case "organization":
      existingUser = await Organization.findOne({ email });
      break;
    case "super_admin":
      existingUser = await SuperAdmin.findOne({ email });
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  // Only prevent registration if user exists AND is verified
  if (existingUser && existingUser.isVerified === true) {
    throw new ApiError(
      400,
      `Email ${email} is already registered as a ${role}`
    );
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin;
  let isUpdatingExistingUser = false;

  // If user exists but is not verified, update the existing user instead of creating new one
  if (existingUser && existingUser.isVerified === false) {
    isUpdatingExistingUser = true;
    user = existingUser;

    // Update user fields with new registration data
    user.name = name;
    user.password = password; // This will be hashed by the pre-save middleware

    // Update role-specific fields
    switch (role) {
      case "mentor":
        if (!phone) throw new ApiError(400, "Phone is required for mentors");
        if (
          !specialization ||
          !experience ||
          !yearsOfExperience ||
          !skillsExpertise
        ) {
          throw new ApiError(
            400,
            "Specialization, experience, yearsOfExperience, and skillsExpertise are required for mentors"
          );
        }
        (user as IMentor).phone = phone;
        (user as IMentor).specialization = specialization;
        (user as IMentor).experience = experience;
        (user as IMentor).yearsOfExperience = yearsOfExperience;
        (user as IMentor).skillsExpertise = skillsExpertise;
        break;
      case "student":
        if (!phone) throw new ApiError(400, "Phone is required for students");
        (user as IStudent).phone = phone;
        break;
      case "organization":
        if (!slug)
          throw new ApiError(400, "Slug is required for organizations");
        (user as IOrganization).slug = slug;
        break;
      case "super_admin":
        if (adminPrivileges) {
          (user as ISuperAdmin).adminPrivileges = adminPrivileges;
        }
        break;
    }
  } else {
    // Create new user if no existing user found
    switch (role) {
      case "mentor":
        if (!phone) throw new ApiError(400, "Phone is required for mentors");
        if (
          !specialization ||
          !experience ||
          !yearsOfExperience ||
          !skillsExpertise
        ) {
          throw new ApiError(
            400,
            "Specialization, experience, yearsOfExperience, and skillsExpertise are required for mentors"
          );
        }
        user = new Mentor({
          email,
          password,
          role,
          name,
          phone,
          specialization,
          experience,
          yearsOfExperience,
          skillsExpertise,
        });
        break;
      case "student":
        if (!phone) throw new ApiError(400, "Phone is required for students");
        user = new Student({ email, password, role, name, phone });
        break;
      case "organization":
        if (!slug)
          throw new ApiError(400, "Slug is required for organizations");
        user = new Organization({ email, password, role, name, slug });
        break;
      case "super_admin":
        user = new SuperAdmin({ email, password, role, name, adminPrivileges });
        break;
      default:
        sendError(res, 400, "Invalid role");
        return;
    }
  }

  try {
    const otpData = generateOTPForPurpose("registration");
    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(400, `Email ${email} is already registered`);
    }
    throw error; // Rethrow other errors
  }

  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Store single refresh token (for single device login)
  user.refreshToken = {
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
  };

  await user.save();

  res.status(201).json({
    status: "success",
    message: isUpdatingExistingUser
      ? "Registration updated successfully. Please verify your email with the new OTP."
      : "Registration successful. Please verify your email with the OTP sent to your email address.",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      accessToken,
      refreshToken,
    },
  });
});
export const verifyEmail = wrapAsync(async (req: Request, res: Response) => {
  const { email, otp, role }: VerifyEmailBody = req.body;

  if (!email || !otp || !role) {
    sendError(res, 400, "Please provide email, otp, and role");
    return;
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (role) {
    case "mentor":
      user = await Mentor.findOne({ email }).select("+otp +otpExpiry");
      break;
    case "student":
      user = await Student.findOne({ email }).select("+otp +otpExpiry");
      break;
    case "organization":
      user = await Organization.findOne({ email }).select("+otp +otpExpiry");
      break;
    case "super_admin":
      user = await SuperAdmin.findOne({ email }).select("+otp +otpExpiry");
      break;

    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  // Mark as verified and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});
export const resendOTP = wrapAsync(async (req: Request, res: Response) => {
  // Validation is handled by validateRequest middleware
  const { email, role } = req.body as ResendOTPBody;

  // Fetch user by role
  const user = await getUserByRole(role, email, "+otp +otpExpiry");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(409, "User is already verified");
  }

  // Optional: Check if previous OTP is still valid
  if (user.otpExpiry && user.otpExpiry > new Date()) {
    throw new ApiError(
      429,
      "Previous OTP is still valid. Please try again later."
    );
  }

  try {
    const otpData = generateOTPForPurpose("verification");
    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendOTPEmail(email, otpData.otp, user.name);
  } catch (error: any) {
    logger.error(`Failed to resend OTP for ${email}: ${error.message}`);
    throw new ApiError(500, "Failed to resend OTP");
  }

  res.status(200).json({
    status: "success",
    message: "OTP sent to your email for verification",
  });
});
export const login = wrapAsync(async (req: Request, res: Response) => {
  const { email, password, role }: LoginBody = req.body;

  if (!email || !password || !role) {
    sendError(res, 400, "Please provide email, password, and role");
    return;
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (role) {
    case "mentor":
      user = await Mentor.findByEmailWithPassword(email);
      break;
    case "student":
      user = await Student.findByEmailWithPassword(email);
      break;
    case "organization":
      user = await Organization.findByEmailWithPassword(email);
      break;
    case "super_admin":
      user = await SuperAdmin.findByEmailWithPassword(email);
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user || !(await user.comparePassword(password))) {
    sendError(res, 401, "Invalid email or password");
    return;
  }

  if (!user.isVerified) {
    sendError(res, 401, "Account is not verified");
    return;
  }

  if (user.suspended.isSuspended) {
    sendError(res, 401, "Account is suspended Contact support");
    return;
  }

  // Update last login time
  user.lastLogin = new Date();

  // Log current tokenVersion before invalidation
  console.log(`User ${email} - Current tokenVersion: ${user.tokenVersion}`);

  // Invalidate all previous tokens for single device login (increments tokenVersion)
  await user.invalidateAllTokens();

  // Generate new tokens with updated tokenVersion
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Log new tokenVersion
  console.log(`User ${email} - New tokenVersion: ${user.tokenVersion}`);

  res.cookie("accessToken", accessToken, getCookieConfig()); // 12 hours
  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieConfig(30 * 24 * 60 * 60 * 1000) // 30 days
  );

  // Store single refresh token in the database (replaces any existing one)
  user.refreshToken = {
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
  };

  await user.save();

  //remove cached user
  safeCache.del(user._id.toString());

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
});
export const getProfile = wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || !role) {
    sendError(res, 400, "User ID and role are required");
    return;
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  const cachedUser = await safeCache.get(userId);
  if (cachedUser) {
    res.status(200).json({
      status: "success",
      data: cachedUser,
    });
    return;
  }

  switch (role) {
    case "mentor":
      user = await Mentor.findById(userId);
      break;
    case "student":
      user = await Student.findById(userId);
      break;
    case "organization":
      user = await Organization.findById(userId);
      break;
    case "super_admin":
      user = await SuperAdmin.findById(userId);
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  //cache for faster response for 10 minutes (600 seconds)
  safeCache.set(userId, user, 600);

  res.status(200).json({
    status: "success",
    data: user,
  });
});
export const logout = wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || !role) {
    sendError(res, 400, "User ID and role are required");
    return;
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (role) {
    case "mentor":
      user = await Mentor.findById(userId);
      break;
    case "student":
      user = await Student.findById(userId);
      break;
    case "organization":
      user = await Organization.findById(userId);
      break;
    case "super_admin":
      user = await SuperAdmin.findById(userId);
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  await user.invalidateAllTokens();

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  //remove cached user
  safeCache.del(userId);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully from all devices",
  });
});
export const refreshToken = wrapAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as {
      id: string;
      email: string;
      tokenVersion: number;
    };

    let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

    const role =
      (await Mentor.findById(decoded.id))?.role ||
      (await Student.findById(decoded.id))?.role ||
      (await Organization.findById(decoded.id))?.role ||
      (await SuperAdmin.findById(decoded.id))?.role;

    switch (role) {
      case "mentor":
        user = await Mentor.findById(decoded.id).select(
          "+refreshToken +tokenVersion"
        );
        break;
      case "student":
        user = await Student.findById(decoded.id).select(
          "+refreshToken +tokenVersion"
        );
        break;
      case "organization":
        user = await Organization.findById(decoded.id).select(
          "+refreshToken +tokenVersion"
        );
        break;
      case "super_admin":
        user = await SuperAdmin.findById(decoded.id).select(
          "+refreshToken +tokenVersion"
        );
        break;
      default:
        sendError(res, 400, "Invalid user role");
        return;
    }

    if (!user) {
      sendError(res, 401, "User no longer exists");
      return;
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      sendError(res, 401, "Invalid refresh token");
      return;
    }

    // Check single refresh token (not array)
    if (
      !user.refreshToken ||
      user.refreshToken.token !== refreshToken ||
      user.refreshToken.expiresAt < new Date()
    ) {
      sendError(res, 401, "Refresh token is invalid or expired");
      return;
    }

    const accessToken = user.generateAuthToken();

    //remove cached user
    safeCache.del(user._id.toString());

    res.cookie("accessToken", accessToken, getCookieConfig());
    res.status(200).json({
      status: "success",
      data: { accessToken },
    });
  } catch (err) {
    sendError(res, 401, "Invalid refresh token");
    return;
  }
});
export const forgotPassword = wrapAsync(async (req: Request, res: Response) => {
  const { email, role }: { email: string; role: string } = req.body;

  console.log(req.body)

  if (!email || !role) {
    sendError(res, 400, "Email and role are required");
    return;
  }

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (role) {
    case "mentor":
      user = await Mentor.findOne({ email });
      break;
    case "student":
      user = await Student.findOne({ email });
      break;
    case "organization":
      user = await Organization.findOne({ email });
      break;
    case "super_admin":
      user = await SuperAdmin.findOne({ email });
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  try {
    const otpData = generateOTPForPurpose("forgot_password");
    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendForgotPasswordEmail(email, otpData.otp, user.name);
  } catch (error: any) {
    logger.error(
      `Failed to send password reset email for ${email}: ${error.message}`
    );
    throw new ApiError(500, "Failed to send password reset email");
  }

  res.status(200).json({
    status: "success",
    message: "OTP sent to your email for password reset",
  });
});
export const verifyForgotPassword = wrapAsync(
  async (req: Request, res: Response) => {
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

    let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

    switch (role) {
      case "mentor":
        user = await Mentor.findOne({ email }).select("+otp +otpExpiry");
        break;
      case "student":
        user = await Student.findOne({ email }).select("+otp +otpExpiry");
        break;
      case "organization":
        user = await Organization.findOne({ email }).select("+otp +otpExpiry");
        break;
      case "super_admin":
        user = await SuperAdmin.findOne({ email }).select("+otp +otpExpiry");
        break;
      default:
        sendError(res, 400, "Invalid role");
        return;
    }

    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }

    if (user.otp !== otp) {
      sendError(res, 400, "Invalid OTP");
      return;
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      sendError(res, 400, "OTP expired");
      return;
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.password = password;
    await user.save();

    sendSuccess(res, 200, "Password reset successfully", {
      userName: user.name,
    });
  }
);
export const resendForgotPasswordOTP = wrapAsync(
  async (req: Request, res: Response) => {
    const { email, role }: { email: string; role: string } = req.body;

    console.log("[DEBUG] Request body:", req.body);

    if (!email || !role) {
      sendError(res, 400, "Email and role are required");
      return;
    }

    let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

    switch (role) {
      case "mentor":
        user = await Mentor.findOne({ email });
        break;
      case "student":
        user = await Student.findOne({ email });
        break;
      case "organization":
        user = await Organization.findOne({ email });
        break;
      case "super_admin":
        user = await SuperAdmin.findOne({ email });
        break;
      default:
        sendError(res, 400, "Invalid role");
        return;
    }

    if (!user) {
      console.log("[DEBUG] User not found for email:", email);
      sendError(res, 404, "User not found");
      return;
    }

    if (user.otpExpiry && user.otpExpiry > new Date()) {
      console.log("[DEBUG] OTP still valid. Expiry:", user.otpExpiry, "Current time:", new Date());
      sendError(res, 400, "Previous OTP is still valid. Please try again later.");
      return;
    }

    try {
      const otpData = generateOTPForPurpose("forgot_password");
      console.log("[DEBUG] Generated OTP for email:", email, "OTP:", otpData.otp);

      user.otp = otpData.otp;
      user.otpExpiry = otpData.expiry;
      await user.save();
      console.log("[DEBUG] User updated with new OTP for email:", email);

      await sendForgotPasswordEmail(email, otpData.otp, user.name);
      console.log("[DEBUG] OTP email sent to:", email);

      res.status(200).json({
        status: "success",
        message: "OTP sent to your email for password reset",
      });
    } catch (error: any) {
      console.error("[DEBUG] Failed to resend OTP for email:", email, "Error:", error.message);
      logger.error(`Failed to resend OTP for ${email}: ${error.message}`);
      throw new ApiError(500, "Failed to resend OTP");
    }
  }
);
export const resetPassword = wrapAsync(async (req: Request, res: Response) => {
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

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (userRole) {
    case "mentor":
      user = await Mentor.findById(userId);
      break;
    case "student":
      user = await Student.findById(userId);
      break;
    case "organization":
      user = await Organization.findById(userId);
      break;
    case "super_admin":
      user = await SuperAdmin.findById(userId);
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  user.password = password;
  await user.save();

  sendSuccess(res, 200, "Password reset successfully", {
    userName: user.name,
  });
});
export const updateProfile = wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    sendError(res, 400, "User ID and role are required");
    return;
  }

  // Delete user cache data
  safeCache.del(userId.toString());

  let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

  switch (userRole) {
    case "mentor":
      user = await Mentor.findById(userId);
      break;
    case "student":
      user = await Student.findById(userId);
      break;
    case "organization":
      user = await Organization.findById(userId);
      break;
    case "super_admin":
      user = await SuperAdmin.findById(userId);
      break;
    default:
      sendError(res, 400, "Invalid role");
      return;
  }

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  const { name, phone, bio, goals, background } = req.body;

  console.log("[DEBUG] Received body:", req.body);
  console.log("[DEBUG] Received file:", req.file);

  // Parse background if it’s a JSON string
  let parsedBackground;
  if (background) {
    try {
      parsedBackground = typeof background === 'string' ? JSON.parse(background) : background;
      console.log("[DEBUG] Parsed background:", parsedBackground);
    } catch (error) {
      console.error("[DEBUG] Failed to parse background:", error);
      sendError(res, 400, "Invalid background data");
      return;
    }
  }

  // Handle profile image upload for student and mentor
  let profileImage: { publicUrl: string; fileId: string } | undefined;
  if (req.file && ["student", "mentor"].includes(userRole)) {
    try {

      // Delete previous image from Cloudinary and database (only for students and mentors)
      if (["student", "mentor"].includes(userRole)) {
        const userWithImage = user as IStudent | IMentor;
        if (userWithImage.profileImageUrl) {
          try {
            // Find the existing file record to get the correct fileId
            const existingFile = await FileModel.findOne({
              userId,
              publicUrl: userWithImage.profileImageUrl,
              fileType: "image"
            });

            if (existingFile && existingFile.fileId) {
              console.log("[DEBUG] Deleting previous image with fileId:", existingFile.fileId);

              // Delete from Cloudinary
              await deleteFile(existingFile.fileId, "image");

              // Delete from database
              await FileModel.deleteOne({ _id: existingFile._id });

              console.log("[DEBUG] Previous image deleted successfully");
            } else {
              console.warn("[DEBUG] No existing file record found for URL:", userWithImage.profileImageUrl);
            }
          } catch (deleteError: any) {
            console.error("[DEBUG] Error deleting previous image:", deleteError);
            // Don't throw error here - continue with upload even if deletion fails
          }
        }
      }

      // Validate file before upload
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        sendError(res, 400, "Invalid file type. Only JPEG, PNG, and JPG files are allowed.");
        return;
      }

      if (req.file.size > maxFileSize) {
        sendError(res, 400, "File size too large. Maximum size is 5MB.");
        return;
      }

      const result = await uploadImage(req.file);
      console.log("[DEBUG] uploadImage result:", result);

      if (!result || !result.secure_url || !result.public_id) {
        throw new Error("Failed to upload image to cloud storage");
      }

      profileImage = { publicUrl: result.secure_url, fileId: result.public_id };

      // Save to File collection with additional metadata
      const file = new FileModel({
        userId,
        publicUrl: profileImage.publicUrl,
        fileId: profileImage.fileId,
        fileType: "image",
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
      });

      await file.save();
      console.log("[DEBUG] File saved to FileModel:", file);

      // Update user with profile image URL
      if (userRole === "student" || userRole === "mentor") {
        (user as IStudent | IMentor).profileImageUrl = profileImage.publicUrl;
        console.log("[DEBUG] Updated profileImageUrl:", profileImage.publicUrl);
      }
    } catch (error: any) {
      console.error("[DEBUG] Profile image upload error:", error);

      // If we have a partial upload (image uploaded but file record failed), try to clean up
      if (profileImage?.fileId) {
        try {
          await deleteFile(profileImage.fileId, "image");
          console.log("[DEBUG] Cleaned up partially uploaded image");
        } catch (cleanupError) {
          console.error("[DEBUG] Failed to cleanup partially uploaded image:", cleanupError);
        }
      }

      const errorMessage = error.message || "Unknown error occurred during image upload";
      sendError(res, 500, `Failed to upload profile image: ${errorMessage}`);
      return;
    }
  }

  // Common properties for all user types
  if (name) user.name = name;

  // Properties specific to certain user types
  switch (userRole) {
    case "student":
      const studentUser = user as IStudent;
      if (phone) studentUser.phone = phone;
      if (bio) studentUser.bio = bio;
      if (goals) studentUser.goals = goals;
      if (parsedBackground) {
        studentUser.background = parsedBackground;
      }
      break;

    case "mentor":
      const mentorUser = user as IMentor;
      if (phone) mentorUser.phone = phone;
      if (bio) mentorUser.bio = bio;
      break;

    case "organization":
      // Organizations only have name (already handled above)
      break;

    case "super_admin":
      // Super admins only have name (already handled above)
      break;
  }

  try {
    await user.save();
    console.log("[DEBUG] User saved:", user);
  } catch (error: any) {
    console.error("[DEBUG] Mongoose save error:", error);
    sendError(res, 500, `Failed to save profile: ${error.message}`);
    return;
  }

  console.log("[DEBUG] Profile updated for user:", userId);
  sendSuccess(res, 200, "Profile updated successfully", {
    ...user.toObject(),
    profileImageUrl: (user as IStudent | IMentor).profileImageUrl,
  });
});