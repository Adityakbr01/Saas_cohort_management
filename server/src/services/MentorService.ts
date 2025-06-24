// import { Role } from "@/configs/roleConfig";
// import { LoginData } from "@/controllers/userController";
// import { StudentDAO } from "@/dao/studentDao";
// import { UserDAO } from "@/dao/user.dao";
// import Student, { IStudent } from "@/models/student";
// import { ApiError } from "@/utils/apiError";
// import { logger } from "@/utils/logger";
// import {
//   cleanExpiredOTP,
//   cleanExpiredOTPMentor,
//   generateOTPForPurpose,
//   verifyOTP,
// } from "@/utils/otpUtils";
// import jwt from "jsonwebtoken";
// import { sendOTPEmail, sendPasswordResetEmail } from "./emailService";
// import { MentorDAO } from "@/dao/mentorDao";
// import Mentor, { IMentor } from "@/models/mentorModel";

// export const MentorService = {
//   // Register Mentor - Step 1: Send OTP
//   async initiateRegistration(userData: any) {
//     try {
//       const {
//         email,
//         name,
//         password,
//         phone,
//         experience,
//         specialization,
//         yearsOfExperience,
//         skillsExpertise,
//       } = userData;
//       const existingUser = await Mentor.findOne({ email });
//       if (existingUser && existingUser.isVerified) {
//         throw new ApiError(409, "User already exists with this email");
//       }
//       const otpData = generateOTPForPurpose("registration");

//       if (existingUser && !existingUser.isVerified) {
//         existingUser.otp = otpData.otp;
//         existingUser.otpExpiry = otpData.expiry;
//         existingUser.name = name;
//         await existingUser.save();

//         await sendOTPEmail(email, otpData.otp, name);

//         logger.info(`OTP resent for ${email}`);
//         return {
//           success: true,
//           message:
//             "OTP sent to your email. Please verify to complete registration.",
//           userId: existingUser._id.toString(),
//         };
//       }

//       await MentorDAO.createMentor({
//         email,
//         name,
//         phone,
//         password: password,
//         otp: otpData.otp,
//         otpExpiry: otpData.expiry,
//         isVerified: false,
//         experience: experience,
//         specialization: specialization,
//         yearsOfExperience: yearsOfExperience,
//         skillsExpertise: skillsExpertise,
//       });

//       await sendOTPEmail(email, otpData.otp, name);

//       logger.info(`Registration initiated for user: ${email}`);
//       return {
//         success: true,
//         message:
//           "OTP sent to your email. Please verify to complete registration.",
//       };
//     } catch (error: any) {
//       logger.error(`Registration initiation failed: ${error.message}`);
//       throw new ApiError(500, error.message);
//     }
//   },
//   // Complete registration - Step 2: Verify OTP and set password
//   async register(data: Partial<IMentor>) {
//     const { email, otp } = data;

//     if (!otp) {
//       throw new ApiError(400, "OTP are required.");
//     }

//     if (!email) {
//       throw new ApiError(400, "Email is required.");
//     }

//     const existingStudent = await MentorDAO.findByEmailWithPassword(email);
//     if (!existingStudent) {
//       throw new ApiError(404, "User not found.");
//     }

//     if (existingStudent.isVerified) {
//       throw new ApiError(409, "User is already verified.");
//     }

//     cleanExpiredOTPMentor(existingStudent);

//     const otpResult = verifyOTP(
//       otp as string,
//       existingStudent.otp!,
//       existingStudent.otpExpiry!
//     );

//     if (!otpResult.isValid) {
//       throw new ApiError(400, otpResult.error!);
//     }

//     if (otpResult.isOTPExpired) {
//       cleanExpiredOTPMentor(existingStudent);
//       throw new ApiError(400, "OTP has expired. Please request a new OTP.");
//     }

//     existingStudent.isVerified = true;
//     existingStudent.otp = undefined;
//     existingStudent.otpExpiry = undefined;

//     await existingStudent.save();

//     return existingStudent;
//   },

//   // Resend OTP for verification
//   async resendOTP(email: string): Promise<any> {
//     try {
//       const user = await StudentDAO.findByEmailWithPassword(email);
//       if (!user) {
//         throw new ApiError(404, "User not found");
//       }

//       if (user.isVerified) {
//         throw new ApiError(409, "User is already verified");
//       }

//       const otpData = generateOTPForPurpose("verification");
//       user.otp = otpData.otp;
//       user.otpExpiry = otpData.expiry;
//       await user.save();

//       await sendOTPEmail(email, otpData.otp, user.name);

//       logger.info(`OTP resent for user: ${email}`);
//       return {
//         success: true,
//         message: "OTP sent to your email",
//       };
//     } catch (error: any) {
//       logger.error(`OTP resend failed: ${error.message}`);
//       throw error;
//     }
//   },

//   async loginUser(loginData: LoginData): Promise<any> {
//     try {
//       const { email, password } = loginData;

//       const student = await StudentDAO.findByEmailWithPassword(email);
//       if (!student) {
//         throw new ApiError(401, "Invalid email or password");
//       }

//       if (!student.isVerified) {
//         throw new ApiError(403, "Please verify your email before logging in");
//       }

//       if (!student.isActive) {
//         throw new ApiError(
//           403,
//           "Account has been deactivated. Please contact support"
//         );
//       }

//       // Check if the student is suspended
//       if (student.status === "suspended") {
//         throw new ApiError(
//           403,
//           "Your account has been suspended. Please contact support."
//         );
//       }

//       const isPasswordValid = await student.comparePassword(password);
//       if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid email or password");
//       }

//       // Log current tokenVersion before invalidation
//       logger.info(
//         `User ${email} - Current tokenVersion: ${student.tokenVersion}`
//       );

//       // Invalidate all previous tokens for single device login
//       await StudentDAO.invalidateAllTokens(student._id.toString());

//       // Fetch user again to get updated tokenVersion
//       const updatedUser = await StudentDAO.findById(student._id.toString());
//       if (!updatedUser) {
//         throw new ApiError(500, "User not found after token invalidation");
//       }

//       // Log new tokenVersion
//       logger.info(
//         `User ${email} - New tokenVersion: ${updatedUser.tokenVersion}`
//       );

//       const token = updatedUser.generateAuthToken();
//       const refreshToken = updatedUser.generateRefreshToken();

//       // Store refresh token in the database
//       await StudentDAO.storeRefreshToken(
//         updatedUser._id.toString(),
//         refreshToken
//       );

//       // Update last login
//       await student.updateOne({ lastLogin: new Date() });

//       // Fetch user again to confirm refresh token storage
//       const finalUser = await StudentDAO.findById(updatedUser._id.toString());
//       if (!finalUser) {
//         throw new ApiError(500, "User not found after updates");
//       }

//       logger.info(
//         `User logged in: ${email}, Refresh tokens count: ${finalUser.refreshTokens.length}`
//       );

//       return {
//         success: true,
//         message: "Login successful",
//         token,
//         refreshToken,
//         user: {
//           id: finalUser._id.toString(),
//           email: finalUser.email,
//           name: finalUser.name,
//           role: finalUser.role,
//           isVerified: finalUser.isVerified,
//           lastLogin: finalUser.lastLogin || new Date(),
//         },
//       };
//     } catch (error: any) {
//       logger.error(`Login failed for ${loginData.email}: ${error.message}`);
//       throw new ApiError(401, error.message);
//     }
//   },

//   async getProfile(userId: string) {
//     const user = await StudentDAO.getProfileById(userId);
//     if (!user) throw new ApiError(404, "User not found");
//     return user;
//   },

//   async updateProfile(userId: string, update: Partial<IStudent>) {
//     console.log(update);
//     return await StudentDAO.updateProfile(userId, update);
//   },

//   async logout(userId: string) {
//     await StudentDAO.invalidateAllTokens(userId);
//   },

//   async allUsers(role: string, targetRole: string, userId: string) {
//     if (role !== "org_admin") {
//       throw new ApiError(
//         403,
//         "Access denied. Only org_admins can access this route."
//       );
//     }
//     return await UserDAO.getAllUsers(targetRole ? { role: targetRole } : {});
//   },

//   async deleteUser(userId: string) {
//     const user = await UserDAO.findById(userId);

//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     if (user.role === "super_admin") {
//       throw new ApiError(403, "Cannot delete super_admin user");
//     }
//     await UserDAO.deleteUser(userId);
//     return { success: true, message: "User deleted successfully" };
//   },
//   async deleteOrgUserById(userId: string) {
//     const user = await UserDAO.findById(userId);

//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     if (user.role === Role.super_admin) {
//       throw new ApiError(403, "Cannot delete super_admin user");
//     }

//     if (user.role !== Role.org_admin) {
//       throw new ApiError(403, "Only org_admin users can be deleted");
//     }

//     await UserDAO.deleteUser(userId);
//     return { success: true, message: "Org Admin deleted successfully" };
//   },
//   async updateUserRole(userId: string, newRole: string) {
//     const validRoles = Object.values(Role);
//     if (!validRoles.includes(newRole)) {
//       throw new ApiError(400, "Invalid role provided");
//     }

//     const user = await UserDAO.findById(userId);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     if (user.role === Role.super_admin) {
//       throw new ApiError(403, "Cannot change role of a super_admin");
//     }

//     return await UserDAO.updateRole(userId, newRole);
//   },
//   async initiateForgotPassword(email: string) {
//     const student = await StudentDAO.findByEmailWithPassword(email);
//     if (!student) {
//       throw new ApiError(404, "User not found");
//     }
//     if (!student.isVerified) {
//       throw new ApiError(
//         403,
//         "Please verify your email before resetting password"
//       );
//     }

//     if (student.status === "suspended") {
//       throw new ApiError(
//         403,
//         "Your account has been suspended. Please contact support."
//       );
//     }

//     const otpData = generateOTPForPurpose("forgot_password");
//     student.otp = otpData.otp;
//     student.otpExpiry = otpData.expiry;
//     await student.save();
//     await sendPasswordResetEmail(email, otpData.otp, student.name);
//     logger.info(`Forgot password OTP sent to ${email}`);
//     return {
//       success: true,
//       message: "OTP sent to your email for password reset",
//       userId: student._id.toString(),
//     };
//   },
//   async completeForgotPassword(
//     email: string,
//     otp: string,
//     newPassword: string
//   ) {
//     if (!email || !otp || !newPassword) {
//       throw new ApiError(400, "Email, OTP and new password are required");
//     }

//     const student = await StudentDAO.findByEmailWithPassword(email);
//     if (!student) {
//       throw new ApiError(404, "student not found");
//     }

//     if (!student.isVerified) {
//       throw new ApiError(
//         403,
//         "Please verify your email before resetting password"
//       );
//     }

//     if (student.status === "suspended") {
//       throw new ApiError(
//         403,
//         "Your account has been suspended. Please contact support."
//       );
//     }

//     const otpResult = verifyOTP(otp, student.otp!, student.otpExpiry!);

//     if (otpResult.isOTPExpired) {
//       cleanExpiredOTP(student);
//       throw new ApiError(400, "OTP has expired. Please request a new OTP.");
//     }

//     console.log(otpResult);
//     if (!otpResult.isValid) {
//       throw new ApiError(400, otpResult.error!);
//     }

//     student.password = newPassword;
//     student.otp = undefined;
//     student.otpExpiry = undefined;
//     await student.save();

//     logger.info(`Password reset successful for ${email}`);
//     return { success: true, message: "Password reset successfully" };
//   },

//   async refreshAccessToken(refreshToken: string) {
//     try {
//       const decoded = jwt.verify(
//         refreshToken,
//         process.env.JWT_REFRESH_SECRET as string
//       ) as {
//         id: string;
//         tokenVersion: number;
//       };
//       if (!decoded.id || !decoded.tokenVersion) {
//         throw new ApiError(401, "Invalid refresh token");
//       }

//       const student = await StudentDAO.findById(decoded.id);
//       if (!student) {
//         throw new ApiError(401, "Invalid refresh token");
//       }

//       if (student.tokenVersion !== decoded.tokenVersion) {
//         throw new ApiError(401, "Invalid refresh token");
//       }

//       const newAccessToken = student.generateAuthToken();

//       return {
//         success: true,
//         message: "Access token refreshed",
//         token: newAccessToken,
//       };
//     } catch (error: any) {
//       logger.error(`Refresh token failed: ${error.message}`);
//       throw new ApiError(401, "Invalid refresh token");
//     }
//   },
// };
