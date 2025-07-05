import Organization from "@/models/organization.model";
import { ApiError } from "@/utils/apiError";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { Request, Response } from "express";
import { Types } from "mongoose";

import { OrganizationService } from "@/services/organization.service";

export const orgController = {
  createOrg: wrapAsync(async (req: Request, res: Response) => {
    const { name, logo } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    const newOrganization = OrganizationService.createOrganization({
      name,
      logo,
      userId,
    });
    sendSuccess(res, 201, "Organization created successfully", newOrganization);
  }),
  getmyOrg: wrapAsync(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user?.id);

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const org = await OrganizationService.getMyOrg({ userId });

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

    const { organizations, total } = await OrganizationService.getAllOrgs({
      page,
      limit,
    });

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

    const { total, org } = await OrganizationService.getOrgUsers({
      orgId,
      page,
      limit,
    });

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

    const { pendingInvite } = await OrganizationService.inviteUserToOrg({
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
    });

    sendSuccess(res, 200, "Invite sent successfully", {
      inviteId: pendingInvite._id,
    });
  }),
  resendInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.query;
    if (!inviteId || typeof inviteId !== "string") {
      throw new ApiError(400, "Invite ID is required");
    }
    await OrganizationService.resendInvite({ inviteId });

    sendSuccess(res, 200, "Invite resent successfully");
  }),
  cancelInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.body;
    if (!inviteId) {
      throw new ApiError(400, "Invite ID is required");
    }
    await OrganizationService.cancelInvite({ inviteId });
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

    const mentor = await OrganizationService.deleteMentor({ orgId, mentorId });

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
    const { invite } = await OrganizationService.acceptInvite({ email, orgId });

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
    const userId = req.user.id;
    if (!inviteId) {
      throw new ApiError(400, "Invite ID is required");
    }
    await OrganizationService.finalizeInvite({ inviteId, userId });
    sendSuccess(res, 200, "Invite finalized successfully");
  }),
  getOrgMentors: wrapAsync(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user?.id);
    if (!userId) throw new ApiError(401, "Unauthorized");

    const mentors = await OrganizationService.getOrgMentors({ userId });

    sendSuccess(res, 200, "Mentors fetched successfully", mentors);
  }),
  getMentorDetails: wrapAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const mentor = await OrganizationService.getMentorDetails({ email });
    sendSuccess(res, 200, "Mentor fetched successfully", mentor);
  }),
};
