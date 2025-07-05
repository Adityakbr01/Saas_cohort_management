import Mentor from "@/models/mentor.model";
import Organization from "@/models/organization.model";
import PendingInvite from "@/models/PendingInvite";
import { ApiError } from "@/utils/apiError";

import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { sendEmailToJoinOrganization } from "./emailService";

export const OrganizationService = {
  async createOrganization({ name, logo, userId }: any) {
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
    return await organization.save();
  },
  async getMyOrg({ userId }: any) {
    const org = await Organization.findOne(userId).populate("Members");
    if (!org) {
      console.log("No organization found for ownerId:", userId);
      throw new ApiError(404, "Organization not found");
    }
    return org;
  },
  async getAllOrgs({ page, limit }: any) {
    const skip = (page - 1) * limit; // Adjust skip based on page and limit
    const organizations = await Organization.find()
      .skip(skip)
      .limit(limit)
      .populate("Members");

    const total = await Organization.countDocuments();
    return { organizations, total };
  },
  async getOrgUsers({ orgId, page, limit }: any) {
    const skip = (page - 1) * limit; // Adjust skip based on page and limit
    const org = await Organization.findById(orgId).populate({
      path: "Members",
      select: "name email role",
      options: { skip, limit },
    });

    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    const total = org.Members && org.Members.length;
    return { org, total }; // Return the org and total count
  },
  async inviteUserToOrg({
    org,
    orgId,
    name,
    phone,
    specialization,
    experience,
    bio,
    certifications,
    email,
    role,
    invitedBy,
  }: any) {
    // ✅ Check mentor plan limit (including pending invites)
    const totalCurrentMentors = org.Members?.length || 0;
    const pendingMentorInvitesCount = await PendingInvite.countDocuments({
      orgId,
      role: "mentor",
      status: { $in: ["PENDING_USER", "PENDING_ADMIN"] },
    });

    const totalMentorsAfterThisInvite =
      totalCurrentMentors + pendingMentorInvitesCount + 1;

    if (totalMentorsAfterThisInvite > org.subscriptionMeta.maxMentors) {
      const remaining =
        org.subscriptionMeta.maxMentors -
        totalCurrentMentors -
        pendingMentorInvitesCount;
      throw new ApiError(
        400,
        `Mentor limit reached. Only ${
          remaining <= 0 ? 0 : remaining
        } invite slots remaining.`
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
      role: "mentor",
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

      return pendingInvite;
    } catch (error) {
      await PendingInvite.deleteOne({ _id: pendingInvite._id });
      throw new ApiError(500, "Failed to send invite email");
    }
  },
  async resendInvite({ inviteId }: any) {
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
      return;
    } catch (error) {
      throw new ApiError(500, "Failed to resend invite email");
    }
  },
  async cancelInvite({ inviteId }: any) {
    const invite = await PendingInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }
    await PendingInvite.deleteOne({ _id: inviteId });
  },
  async deleteMentor({ orgId, mentorId }: any) {
    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    // Check if organization exists
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new ApiError(404, "Organization not found");
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

    return mentor;
  },
  //@Todo --> Remove this after Test
  async acceptInvite({ email, orgId }: any) {
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
    return invite;
  },
  async finalizeInvite({ inviteId, userId }: any) {
    const invite = await PendingInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    if (invite.invitedBy.toString() !== userId.toString()) {
      throw new ApiError(400, "You cannot finalize other's invite");
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
  },
  async getOrgMentors({ userId }: any) {
    const org = await Organization.findById(userId);
    if (!org) throw new ApiError(404, "Organization not found");

    const memberMentorIds: Types.ObjectId[] = (org.Members || []).map(
      (member: any) => member.user
    );

    const mentors = await Mentor.find({
      _id: { $in: memberMentorIds },
    }).select("name email role specialization lastActive studentsCount");
    return mentors;
  },
  async getMentorDetails({ email }:any) {
    const mentor = await Mentor.findOne({ email }).select(
      "name email phone specialization experience bio certifications"
    );
    return mentor;
  },
};
