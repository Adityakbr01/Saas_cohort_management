import { RegisterBody } from "@/controllers/auth.controller";
import Mentor, { IMentor } from "@/models/mentor.model";
import Organization, { IOrganization } from "@/models/organization.model";
import Student, { IStudent } from "@/models/student.model";
import { SubscriptionModel } from "@/models/subscriptionModel";
import SuperAdmin, { ISuperAdmin } from "@/models/superAdmin.model";
import { ApiError } from "@/utils/apiError";
import { getUserByRole } from "@/utils/modelUtils";
import { generateOTPForPurpose } from "@/utils/otpUtils";
import { sendForgotPasswordEmail, sendOTPEmail } from "./emailService";
import { logger } from "@/utils/logger";
import safeCache from "@/utils/cache";
import { getCookieConfig } from "@/configs/cookieConfig";

import jwt from "jsonwebtoken";
import fileModel from "@/models/file.model";
import { deleteFile, uploadImage } from "./cloudinaryService";
import { Role } from "@/configs/roleConfig";
import isSuperAdmin from "@/utils/isSuperAdmin";

export const authService = {
  async register({
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
  }: RegisterBody) {
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
        throw new ApiError(400, "Invalid role");
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
          const basicPlan = await SubscriptionModel.findOne({ name: "basic" });
          if (!basicPlan) {
            throw new ApiError(400, "Basic plan not found");
          }
          user = new Organization({
            email,
            password,
            role,
            name,
            slug,
            plan: basicPlan._id,
            subscriptionMeta: {
              startDate: new Date(),
              expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // ✅ correctly closed
              maxStudents: basicPlan.maxStudents,
              maxMentors: basicPlan.maxMentors,
              maxCourses: basicPlan.maxCourses,
              isActive: true,
              isExpired: false,
            },
          });
          break;
        case "super_admin":
          user = new SuperAdmin({
            email,
            password,
            role,
            name,
            adminPrivileges,
            isMasterAdmin: false,
            isVerifiedByAdmin: false,
          });
          break;
        default:
          throw new ApiError(400, "Invalid role");
      }
    }

    try {
      const otpData = generateOTPForPurpose("registration");
      user.otp = otpData.otp;
      user.otpExpiry = otpData.expiry;
      await user.save();
      console.log(`Sending OTP email to ${user.email}`);
      await sendOTPEmail(user.email, otpData.otp, user.name);
      console.log(`OTP email sent successfully to ${user.email}`);
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
    return { user, accessToken, refreshToken };
  },
  async verifyEmail(email: string, otp: string, role: string) {
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
        throw new ApiError(400, "Invalid role");
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
    return user;
  },
  async resendOTP(role: string, email: string) {
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
  },
  async login(email: string, password: string, role: string) {
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
        throw new ApiError(400, "Invalid role");
        return;
    }

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
      return;
    }

    if (!user.isVerified) {
      throw new ApiError(401, "Account is not verified");
    }

    if (isSuperAdmin(user) && !user.isVerifiedByAdmin) {
      throw new ApiError(401, "Invalid role");
    }

    if (user.suspended.isSuspended) {
      throw new ApiError(401, "Account is suspended Contact support");
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
    // console.log(`User ${email} - New tokenVersion: ${user.tokenVersion}`);

    // Store single refresh token in the database (replaces any existing one)
    user.refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
    };

    await user.save();

    //remove cached user
    safeCache.del(user._id.toString());

    return { accessToken, refreshToken, user };
  },
  async getProfile(userId: string, role: string) {
    if (!userId || !role) {
      throw new ApiError(400, "User ID and role are required");
    }

    let user: IMentor | IStudent | IOrganization | ISuperAdmin | null;

    const cachedUser = await safeCache.get(userId);
    if (cachedUser) {
      return cachedUser;
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
        throw new ApiError(400, "Invalid Role!");
    }
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    //cache for faster response for 10 minutes (600 seconds)
    safeCache.set(userId, user, 600);
    return user;
  },
  async logout(userId: string, role: string) {
    if (!userId || !role) {
      throw new ApiError(400, "User ID and role are required");
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
        throw new ApiError(400, "Invalid Role!");
    }

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await user.invalidateAllTokens();
    //remove cached user
    safeCache.del(userId);

    return true;
  },
  async refreshToken(refreshToken: string) {
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
          throw new ApiError(400, "Invalid user role");
      }

      if (!user) {
        throw new ApiError(401, "User no longer exists");
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Check single refresh token (not array)
      if (
        !user.refreshToken ||
        user.refreshToken.token !== refreshToken ||
        user.refreshToken.expiresAt < new Date()
      ) {
        throw new ApiError(401, "Refresh token is invalid or expired");
      }

      const accessToken = user.generateAuthToken();

      //remove cached user
      safeCache.del(user._id.toString());
      return accessToken;
    } catch (err) {
      throw new ApiError(401, "Invalid refresh token");
    }
  },
  async forgotPassword(email: string, role: string) {
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
        throw new ApiError(400, "Invalid role");
    }

    if (!user) {
      throw new ApiError(404, "User not found");

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
  },
  async verifyForgotPassword(
    email: string,
    otp: string,
    password: string,
    role: string
  ) {
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
        throw new ApiError(400, "Invalid role");
        return;
    }

    if (!user) {
      throw new ApiError(404, "User not found");
      return;
    }

    if (user.otp !== otp) {
      throw new ApiError(400, "Invalid OTP");
      return;
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new ApiError(400, "OTP expired");
      return;
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.password = password;
    await user.save();
  },
  async resendForgotPasswordOTP(email: string, role: string) {
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
        throw new ApiError(400, "Invalid role");
    }

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.otpExpiry && user.otpExpiry > new Date()) {
      console.debug(
        "[DEBUG] OTP still valid. Expiry:",
        user.otpExpiry,
        "Current time:",
        new Date()
      );
      throw new ApiError(
        400,
        "Previous OTP is still valid. Please try again later."
      );
    }

    try {
      const otpData = generateOTPForPurpose("forgot_password");

      user.otp = otpData.otp;
      user.otpExpiry = otpData.expiry;
      await user.save();
      console.debug("[DEBUG] User updated with new OTP for email:", email);

      await sendForgotPasswordEmail(email, otpData.otp, user.name);
      console.debug("[DEBUG] OTP email sent to:", email);
      return;
    } catch (error: any) {
      logger.error(`Failed to resend OTP for ${email}: ${error.message}`);
      throw new ApiError(500, "Failed to resend OTP");
    }
  },
  async resetPassword(userId: string, userRole: string, password: string) {
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
        throw new ApiError(400, "Invalid role");
    }
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.password = password;
    await user.save();
  },
  async updateProfile({
    userId,
    userRole,
    body,
    file,
  }: {
    userId: string;
    userRole: string;
    body: any;
    file?: Express.Multer.File;
  }) {
    safeCache.del(userId);

    let user:
      | (IMentor | IStudent | IOrganization | ISuperAdmin)
      | null = null;

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
        throw new ApiError(400, "Invalid role");
    }

    if (!user) throw new ApiError(404, "User not found");

    const { name, phone, bio, goals, background } = body;

    // Parse background if it's string
    let parsedBackground;
    if (background) {
      try {
        parsedBackground =
          typeof background === "string"
            ? JSON.parse(background)
            : background;
      } catch (e) {
        throw new ApiError(400, "Invalid background data");
      }
    }

    // Profile image handling (Mentor/Student)
    let profileImage: { publicUrl: string; fileId: string } | undefined;

    if (file && ["student", "mentor"].includes(userRole)) {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxFileSize = 5 * 1024 * 1024;

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError(400, "Invalid file type. JPEG/PNG only.");
      }

      if (file.size > maxFileSize) {
        throw new ApiError(400, "File size exceeds 5MB");
      }

      // Delete previous image
      const existingFile = await fileModel.findOne({
        userId,
        publicUrl: (user as IStudent | IMentor).profileImageUrl,
        fileType: "image",
      });

      if (existingFile?.fileId) {
        await deleteFile(existingFile.fileId, "image");
        await fileModel.deleteOne({ _id: existingFile._id });
      }

      const result = await uploadImage(file);
      if (!result || !result.secure_url || !result.public_id) {
        throw new ApiError(500, "Failed to upload image");
      }

      profileImage = {
        publicUrl: result.secure_url,
        fileId: result.public_id,
      };

      await new fileModel({
        userId,
        publicUrl: profileImage.publicUrl,
        fileId: profileImage.fileId,
        fileType: "image",
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      }).save();

      (user as IStudent | IMentor).profileImageUrl = profileImage.publicUrl;
    }

    // Update fields
    if (name) user.name = name;

    if (userRole === "student") {
      const u = user as IStudent;
      if (phone) u.phone = phone;
      if (bio) u.bio = bio;
      if (goals) u.goals = goals;
      if (parsedBackground) u.background = parsedBackground;
    }

    if (userRole === "mentor") {
      const u = user as IMentor;
      if (phone) u.phone = phone;
      if (bio) u.bio = bio;
    }

    await user.save();

    return {
      ...user.toObject(),
      profileImageUrl: (user as IStudent | IMentor).profileImageUrl,
    };
  },
};



