import { Request, Response, NextFunction } from "express";
import Mentor, { IMentor } from "../models/mentor.model";
import Student, { IStudent } from "../models/student.model";
import Organization, { IOrganization } from "../models/organization.model";
// import { AppError, catchAsync } from "../utils/error";
import { ApiError } from "@/utils/apiError";
import { wrapAsync } from "@/utils/wrapAsync";
import { sendError } from "@/utils/responseUtil";
import { generateOTPForPurpose } from "@/utils/otpUtils";
import { getUserByRole } from "@/utils/modelUtils";
import { sendOTPEmail } from "@/services/emailService";
import { logger } from "@/utils/logger";
import { ResendOTPBody } from "@/utils/zod";
import SuperAdmin, { ISuperAdmin } from "@/models/superAdmin.model";

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

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
  });

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

  console.log(req.body);

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

  user.lastLogin = new Date();
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
  });

  await user.save();

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

// export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return next(new AppError("Please provide a refresh token", 400));
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
//       id: string;
//       email: string;
//       tokenVersion: number;
//     };

//     let user: IMentor | IStudent | IOrganization | null;

//     const role = (await Mentor.findById(decoded.id))?.role
//       || (await Student.findById(decoded.id))?.role
//       || (await Organization.findById(decoded.id))?.role;

//     switch (role) {
//       case "mentor":
//         user = await Mentor.findById(decoded.id);
//         break;
//       case "student":
//         user = await Student.findById(decoded.id);
//         break;
//       case "organization":
//         user = await Organization.findById(decoded.id);
//         break;
//       default:
//         return next(new AppError("Invalid user role", 400));
//     }

//     if (!user) {
//       return next(new AppError("User no longer exists", 401));
//     }

//     if (user.tokenVersion !== decoded.tokenVersion) {
//       return next(new AppError("Invalid refresh token", 401));
//     }

//     const tokenExists = user.refreshTokens.find((t) => t.token === refreshToken && t.expiresAt > new Date());
//     if (!tokenExists) {
//       return next(new AppError("Refresh token is invalid or expired", 401));
//     }

//     const accessToken = user.generateAuthToken();

//     res.status(200).json({
//       status: "success",
//       data: { accessToken },
//     });
//   } catch (err) {
//     return next(new AppError("Invalid refresh token", 401));
//   }
// });

// export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) {
//     return next(new AppError("No user is logged in", 401));
//   }

//   await req.user.invalidateAllTokens();

//   res.status(200).json({
//     status: "success",
//     message: "Logged out successfully",
//   });
// });
