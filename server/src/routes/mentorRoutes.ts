import express from "express";
const router = express.Router();

import { validateRequest } from "@/middleware/validateRequest";
import {
  loginInput,
  resendOtpInput,
  updateProfileInput,
  validateRegisterInput,
  validateRegisterInputcomplate,
} from "@/utils/zod/user";
// import { MentorController } from "@/controllers/mentorController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "@/utils/apiError";
import PendingInvite from "@/models/PendingInvite";
import Organization from "@/models/organization.model";
import Mentor from "@/models/mentor.model";

// //Done ✅ --> todo add zod for inputs
// // Registration and Authentication
// router.post(
//   "/register/initiate",
//   createDynamicRateLimiter({
//     timeWindow: 10,// 10 minutes
//     maxRequests: 4, // Limit to 4 requests per 10 minutes
//   }),
//   MentorController.initiateRegistrationController
// );

// //Done ✅ --> todo add zod for inputs
// router.post(
//   "/register/complete",
//   MentorController.complateRegisterController
// );

// router.post(
//   "/resend-otp",
//   createDynamicRateLimiter({
//     timeWindow: 10,
//     maxRequests: 3,
//   }),
//   validateRequest(resendOtpInput),
//   MentorController.resendOTPController
// );

// router.post(
//   "/login",
//   validateRequest(loginInput),
//   MentorController.loginController
// );

// // Profile Management
// router.get(
//   "/profile",
//   protect,
//   MentorController.profile
// );

// router.patch(
//   "/profile",
//   validateRequest(updateProfileInput),
//   protect,
//   MentorController.updateProfile
// );

// router.delete(
//   "/delete",
//   protect,
//   MentorController.deleteUser
// );

// // Session Management
// router.post(
//   "/logout",
//   protect,
//   MentorController.logout
// );

// // router.get(
// //   "/refresh-token",
// //   MentorController.refreshAccessToken
// // );

// // Password Management
// router.post(
//   "/initiate-forgot-password",
//   createDynamicRateLimiter({
//     timeWindow: 1,
//     maxRequests: 5,
//   }),
//   MentorController.initiateforgotPassword
// );

// router.post(
//   "/complete-forgot-password",
//   MentorController.completeforgotPassword
// );

// router.post(
//   "/resend-forgot-password-otp",
//   createDynamicRateLimiter({
//     timeWindow: 10,
//     maxRequests: 4,
//   }),
//   MentorController.resendForgotPasswordOtp
// );

import { Request, Response, Router } from "express";
import { Types } from "mongoose";
import { env_config } from "@/configs/env";

interface InviteTokenPayload extends JwtPayload {
  email: string;
  orgId: string;
  role: "mentor" | "student" | "admin";
}

interface InviteTokenPayload {
  email: string;
  role: "mentor" | "student" | "admin";
  orgId: string;
  iat?: number;
  exp?: number;
}

router.get("/accept-invite-mentor", async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ success: false, message: "Token is missing" });
      return;
    }

    let decoded: InviteTokenPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as InviteTokenPayload;
    } catch (err) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    const { email, orgId, role } = decoded;

    const invite = await PendingInvite.findOne({ email, orgId });
    if (!invite) throw new ApiError(404, "Invite not found");

    if (["ACCEPTED", "REJECTED", "PENDING_ADMIN"].includes(invite.status)) {
      throw new ApiError(
        400,
        `Invite cannot be accepted (status: ${invite.status})`
      );
    }

    const org = await Organization.findById(orgId);
    if (!org) throw new ApiError(404, "Organization not found");

    const mentor = await Mentor.findOne({ email });
    if (!mentor) throw new ApiError(404, "Mentor not found");

    // Check if already a member
    const isAlreadyMember = org.Members?.some((member: any) =>
      new Types.ObjectId(member.user).equals(mentor._id)
    );
    if (isAlreadyMember) {
      throw new ApiError(
        400,
        "Mentor is already a member of this organization"
      );
    }

    // Update invite status
    invite.status = role === Role.mentor ? "PENDING_ADMIN" : "ACCEPTED";
    await invite.save();
    await org.save();

    res.redirect(
      `${env_config.Fronted_URL}?success=true&message=Invite accepted successfully, wait for admin approval`
    );
    return;
  } catch (err: any) {
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    console.error("Unexpected Error in /accept-invite-mentor:", err.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
    return;
  }
});

router.get("/getmyorg", protect, async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user?.id);
    if (!userId) throw new ApiError(401, "Unauthorized");

    const orgs = await Organization.find({
      Members: { $elemMatch: { user: userId } },
    })
      .select(
        "_id name slug logo email isVerified isActive plan createdAt updatedAt"
      ) // ❌ "Members" hataya
      .populate({
        path: "Members",
        select: "user", // ✅ Only select user inside Members
      });

    const filteredOrgs = orgs.map((org) => ({
      _id: org._id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      email: org.email,
      isVerified: org.isVerified,
      isActive: org.isActive,
      plan: org.plan,
      Members: org.Members,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));

    res.json(filteredOrgs);
  } catch (err: any) {
    console.error("Unexpected Error in /getmyorg:", err.message);
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: "Something went wrong" });
    return;
  }
});

export default router;
