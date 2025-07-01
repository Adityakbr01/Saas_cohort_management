import { Request, Response } from "express";
import { wrapAsync } from "@/utils/wrapAsync";
import { ApiError } from "@/utils/apiError";
import { sendSuccess, sendError } from "@/utils/responseUtil";
import { sendEmailToJoinOrganization } from "@/services/emailService";
import Organization from "@/models/organization.model";
import Mentor from "@/models/mentor.model";
import PendingInvite from "@/models/PendingInvite";
import User from "@/models/userModel";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { env_config } from "@/configs/env";

// Define interface for the Mentor document
interface IMentor {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  email: string;
  name?: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  certifications?: string[];
  __v: number;
}

// Define interface for the populated User document
interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
}

export const orgController = {
  createOrg: wrapAsync(async (req: Request, res: Response) => {
    const { name, logo } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const existingOrg = await Organization.findOne({ ownerId: userId });
    if (existingOrg) {
      throw new ApiError(400, "User already owns an organization");
    }

    const organization = new Organization({
      name,
      logo,
      ownerId: userId,
      Members: [],
    });

    await organization.save();
    sendSuccess(res, 201, "Organization created successfully", organization);
  }),
  getmyOrg: wrapAsync(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user?.id);

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const org = await Organization.findOne(userId).populate("Members");
    if (!org) {
      console.log("No organization found for ownerId:", userId);
      throw new ApiError(404, "Organization not found");
    }

    console.log("Found organization:", org);
    sendSuccess(res, 200, "Org fetched successfully", org);
  }),
  getAllOrgs: wrapAsync(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user?.id);
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const organizations = await Organization.find()
      .skip(skip)
      .limit(limit)
      .populate("Members");

    const total = await Organization.countDocuments();

    sendSuccess(res, 200, "Organizations fetched successfully", {
      organizations,
      total,
      page,
      limit,
    });
  }),
  getOrgUsers: wrapAsync(async (req: Request, res: Response) => {
    const orgId = req.params.orgId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const org = await Organization.findById(orgId).populate({
      path: "Members",
      select: "name email role",
      options: { skip, limit },
    });

    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    const total = org.Members && org.Members.length;

    sendSuccess(res, 200, "Organization users fetched successfully", {
      users: org.Members,
      total,
      page,
      limit,
    });
  }),
  inviteUserToOrg: wrapAsync(async (req: Request, res: Response) => {
  const {
    name,
    phone,
    specialization,
    experience,
    bio,
    certifications,
    email,
    role = "mentor",
  } = req.body;

  const invitedBy = new Types.ObjectId(req.user?.id);
  if (!invitedBy) throw new ApiError(401, "Unauthorized");

  // ✅ Get Organization
  const org = await Organization.findById(req.user?.id);
  if (!org) throw new ApiError(404, "Organization not found");

  const orgId = org._id;

  // ✅ Check mentor plan limit (including pending invites)
  const totalCurrentMentors = org.Members?.length || 0;
  const pendingMentorInvitesCount = await PendingInvite.countDocuments({
    orgId,
    role: "mentor",
    status: { $in: ["PENDING_USER", "PENDING_ADMIN"] },
  });

  const totalMentorsAfterThisInvite = totalCurrentMentors + pendingMentorInvitesCount + 1;

  if (totalMentorsAfterThisInvite > org.subscriptionMeta.maxMentors) {
    const remaining = org.subscriptionMeta.maxMentors - totalCurrentMentors - pendingMentorInvitesCount;
    throw new ApiError(
      400,
      `Mentor limit reached. Only ${remaining <= 0 ? 0 : remaining} invite slots remaining.`
    );
  }

  // ✅ Validate mentor existence
  const mentor = await Mentor.findOne({ email });
  if (!mentor) throw new ApiError(400, "User is not a mentor");

  // ✅ Check if already added
  const isAlreadyMentor = await Organization.findOne({
    _id: orgId,
    "Members.user": mentor._id,
  });
  if (isAlreadyMentor) {
    throw new ApiError(400, "User is already a mentor in this organization");
  }

  // ✅ Check if already invited
  const isAlreadyInvited = await PendingInvite.findOne({ email, orgId });
  if (isAlreadyInvited) {
    throw new ApiError(400, "Invite already sent. Wait for user to accept.");
  }

  // ✅ Generate token
  const token = jwt.sign(
    { email, role, orgId: org._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const pendingInvite = new PendingInvite({
    email,
    orgId,
    role,
    status: "PENDING_USER",
    invitedBy,
    name,
    phone,
    specialization,
    experience,
    bio,
    certifications,
    token,
    expiresAt,
  });

  await pendingInvite.save();

  try {
    await sendEmailToJoinOrganization(
      email,
      org.name,
      name,
      role,
      orgId.toString(),
      phone,
      specialization,
      experience,
      bio,
      certifications
    );
  } catch (error) {
    await PendingInvite.deleteOne({ _id: pendingInvite._id });
    throw new ApiError(500, "Failed to send invite email");
  }

  sendSuccess(res, 200, "Invite sent successfully", {
    inviteId: pendingInvite._id,
  });
}),
  resendInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.query;
    if (!inviteId || typeof inviteId !== "string") {
      throw new ApiError(400, "Invite ID is required");
    }

    const invite = await PendingInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    const org = await Organization.findById(invite.orgId);
    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    try {
      await sendEmailToJoinOrganization(
        invite.email,
        org.name,
        invite.name,
        invite.role,
        invite.orgId.toString()
      );
    } catch (error) {
      throw new ApiError(500, "Failed to resend invite email");
    }

    sendSuccess(res, 200, "Invite resent successfully");
  }),
  cancelInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.body;
    if (!inviteId) {
      throw new ApiError(400, "Invite ID is required");
    }

    const invite = await PendingInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    await PendingInvite.deleteOne({ _id: inviteId });
    sendSuccess(res, 200, "Invite cancelled successfully");
  }),
  deleteMentor: wrapAsync(async (req: Request, res: Response) => {
    const { mentorId } = req.body;
    const orgId = req.user?.id;

    // Validate inputs
    if (!mentorId) {
      throw new ApiError(400, "Mentor ID is required");
    }
    if (!orgId) {
      throw new ApiError(401, "Unauthorized: Organization ID is missing");
    }

    // Check if organization exists
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    // Check if mentor is a member of the organization
    const isMember = organization.Members?.some(
      (member) => member.user.toString() === mentorId
    );
    if (!isMember) {
      throw new ApiError(400, "Mentor is not a member of this organization");
    }

    // Remove mentor from organization's Members array
    const updateResult = await Organization.updateOne(
      { _id: new Types.ObjectId(orgId) },
      { $pull: { Members: { user: new Types.ObjectId(mentorId) } } }
    );

    // Check if the update modified the document
    if (updateResult.modifiedCount === 0) {
      throw new ApiError(500, "Failed to remove mentor from organization");
    }

    sendSuccess(res, 200, "Mentor removed from organization successfully", {
      mentorId,
      mentorName: mentor.name || "Unknown",
    });
  }),
  acceptInvite: wrapAsync(async (req: Request, res: Response) => {
    const { email, orgId } = req.query;
    if (
      !email ||
      typeof email !== "string" ||
      !orgId ||
      typeof orgId !== "string"
    ) {
      throw new ApiError(400, "Invalid or missing email or orgId");
    }

    const invite = await PendingInvite.findOne({ email, orgId });
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    if (invite.status === "ACCEPTED") {
      throw new ApiError(400, "Invite already accepted");
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: invite.name || email.split("@")[0],
        role: invite.role,
      });
      await user.save();
    }

    invite.status = invite.role === "mentor" ? "PENDING_ADMIN" : "ACCEPTED";
    await invite.save();

    if (invite.status === "ACCEPTED") {
      await Organization.updateOne(
        { _id: orgId },
        { $addToSet: { Members: user._id } }
      );
    }

    if (invite.role === "mentor") {
      const mentor = new Mentor({
        userId: user._id,
        orgId,
        email,
        name: invite.name,
        phone: invite.phone,
        specialization: invite.specialization,
        experience: invite.experience,
        bio: invite.bio,
        certifications: invite.certifications,
      });
      await mentor.save();
    }
    sendSuccess(
      res,
      200,
      invite.role === "mentor"
        ? "Invite accepted, pending admin approval"
        : "Invite accepted successfully"
    );
  }),
  finalizeInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.body;
    if (!inviteId) {
      throw new ApiError(400, "Invite ID is required");
    }

    const invite = await PendingInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    if (invite.status !== "PENDING_ADMIN") {
      throw new ApiError(400, "Invite is not pending admin approval");
    }

    const user = await Mentor.findOne({ email: invite.email });
    if (!user) {
      throw new ApiError(404, "Mentor not found");
    }

    invite.status = "ACCEPTED";
    await invite.save();

    await PendingInvite.deleteOne({ _id: inviteId });

    const org = await Organization.findOne({ _id: invite.orgId });

    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    org.Members?.push({
      user: user._id,
      suspended: {
        isSuspended: false,
        suspendedAt: null,
        reason: "",
      },
      joinDate: new Date(),
    });

    await org.save();

    sendSuccess(res, 200, "Invite finalized successfully");
  }),
  getOrgMentors: wrapAsync(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user?.id);
    if (!userId) throw new ApiError(401, "Unauthorized");

    const org = await Organization.findById(userId);
    if (!org) throw new ApiError(404, "Organization not found");

    const memberMentorIds: Types.ObjectId[] = (org.Members || []).map(
      (member: any) => member.user
    );

    const mentors = await Mentor.find({
      _id: { $in: memberMentorIds },
    }).select("name email role specialization lastActive studentsCount");

    sendSuccess(res, 200, "Mentors fetched successfully", mentors);
  }),
  getMentorDetails: wrapAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const mentor = await Mentor.findOne({ email }).select(
      "name email phone specialization experience bio certifications"
    );

    sendSuccess(res, 200, "Mentor fetched successfully", mentor);
  }),
};
