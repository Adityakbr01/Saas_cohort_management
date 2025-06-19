import { UserDAO } from "@/dao/user.dao";
import Mentor from "@/models/mentorModel";
import Organization from "@/models/organizationModel";
import PendingInvite from "@/models/PendingInvite";
import { sendInviteEmail } from "@/services/emailService";
import { OrganizationService } from "@/services/organization.service";
import { ApiError } from "@/utils/apiError";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { generateInviteToken, verifyInviteToken } from "@/utils/tokenUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { Request, Response } from "express";
import { unknown } from "zod";

export const orgController = {
  createOrg: wrapAsync(async (req: Request, res: Response) => {
    const { name, logo } = req.body;
    const userId = req.user?.id;

    console.log(req.body);
    const organization = await OrganizationService.createOrganization({
      name,
      logo,
      ownerId: userId,
    });

    sendSuccess(res, 201, "Organization created successfully", organization);
  }),

  getmyOrg: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const org = await Organization.findOne({ ownerId: userId }).populate(
      "Members"
    );

    console.log(org);
    sendSuccess(res, 200, "Org fetch succces", org);
  }),

  // Fetch all organizations for a super admin
  getAllOrgs: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const organizations = await OrganizationService.getAllOrg({
      userId,
      page,
      limit,
    });

    sendSuccess(res, 200, "Organizations fetched successfully", organizations);
  }),

  // Fetch all users in an organization
  getOrgUsers: wrapAsync(async (req: Request, res: Response) => {
    const orgId = req.params.orgId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await OrganizationService.getOrgUsers({ orgId, page, limit });
    sendSuccess(res, 200, "Organization users fetched successfully", data);
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
    const invitedBy = req.user.id;

    try {
      const org = await Organization.findOne({ ownerId: invitedBy });
      if (!org) {
        throw new ApiError(404, "Organization not found");
      }
      const orgId = org.id;
      const orgName = org.name;

      const isAllreadyMentor = await Mentor.findOne({ email, orgId });

      if (isAllreadyMentor) {
        sendError(res, 400, "User is already a mentor in this organization");
        return;
      }

      const result = OrganizationService.inviteUserToOrg({
        email,
        orgId,
        role,
        orgName,
        invitedBy,
        name,
        phone,
        specialization,
        experience,
        bio,
        certifications,
      });
      sendSuccess(res, 200, (await result).message);
    } catch (err) {
      if (err instanceof ApiError) {
        sendError(res, err.statusCode, err.message);
        return;
      }
    }
  }),

  acceptInvite: wrapAsync(async (req: Request, res: Response) => {
    const { token } = req.query;
    try {
      const decoded = verifyInviteToken(token as string);

      if (!decoded) {
        throw new ApiError(400, "faild to verify Token");
      }
      const result = await OrganizationService.acceptInvite(decoded);
      sendSuccess(res, 200, result.message);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid or expired token" });
    }
  }),

  finalizeInvite: wrapAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.body;
    try {
      const result = await OrganizationService.finalizeInvite(inviteId);
      sendSuccess(res, 200, result.message);
    } catch (err) {
      if (err instanceof ApiError) {
        sendError(res, err.statusCode, err.message);
        return;
      }
    }
  }),
};
