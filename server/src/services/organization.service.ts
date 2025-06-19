import slugify from "slugify";
import { ApiError } from "@/utils/apiError";
import { OrganizationDAO } from "@/dao/organization.dao";
import Organization from "@/models/organizationModel";
import { sendEmailToJoinOrganization, sendInviteEmail } from "./emailService";
import { findUserByEmail, UserDAO } from "@/dao/user.dao";
import PendingInvite from "@/models/PendingInvite";
import { generateInviteToken } from "@/utils/tokenUtil";

export const OrganizationService = {
  async createOrganization(data: {
    name: string;
    logo?: string;
    ownerId?: string;
  }) {
    const { name, logo, ownerId } = data;

    if (ownerId) {
      const existingOrgUser = await OrganizationDAO.findOrgByUserId(ownerId);
      if (existingOrgUser) {
        throw new ApiError(400, "You already own an organization");
      }
    }
    if (!name) {
      throw new ApiError(400, "Organization name is required");
    }
    const slug = slugify(name, { lower: true, strict: true });
    const existingOrg = await OrganizationDAO.findBySlug(slug);
    if (existingOrg) {
      throw new ApiError(409, "Organization with this name already exists");
    }
    return OrganizationDAO.createOrg({ name, slug, logo, ownerId });
  },
  async getAllOrg({
    userId,
    page,
    limit,
  }: {
    userId: string;
    page: number;
    limit: number;
  }) {
    return OrganizationDAO.findAllOrgs(userId, page, limit);
  },
  async getOrgUsers({
    orgId,
    page,
    limit,
  }: {
    orgId: string;
    page: number;
    limit: number;
  }) {
    return OrganizationDAO.findOrgWithPaginatedMembers(orgId, page, limit);
  },
  async createMentor(data: {
    email: string;
    role: "mentor";
    organizationOwnerID: string;
  }) {
    const { email, role, organizationOwnerID } = data;
    const org = await OrganizationDAO.findOrgByUserId(organizationOwnerID);
    if (!org) {
      throw new ApiError(404, "Organization not found");
    }
    const user = await findUserByEmail(email);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (org && org?.Members?.includes(user?.id || user?._id)) {
      throw new ApiError(409, "Mentor already exists in this organization");
    }

    console.log(org);

    return sendEmailToJoinOrganization(
      email,
      org.name,
      user.name,
      role,
      org.id
    );
  },
  async inviteUserToOrg(data: {
    email: string;
    orgId: string;
    role: string;
    orgName: string;
    invitedBy: string;
  }) {
    const { email, orgId, role, orgName, invitedBy } = data;

    const existingInvite = await PendingInvite.findOne({ email, orgId });

    if (existingInvite) {
      throw new ApiError(409, "Invite already sent");
    }

    const token = generateInviteToken({ email, orgId, role });

    const userExist = await UserDAO.findByEmailWithPassword(email);

    if (!userExist) {
      throw new ApiError(404, "User not found");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    await PendingInvite.create({
      email,
      userId: userExist._id,
      orgId,
      invitedBy,
      role,
      token,
      expiresAt,
    });

    await sendInviteEmail({ email, token, orgName, role });

    return { success: true, message: "Invitation sent successfully." };
  },
  async acceptInvite(decoded: any) {
    const { email, orgId, role } = decoded;

    const invite = await PendingInvite.findOne({ email, orgId });

    if (!invite) {
      throw new ApiError(404, "Invite not found");
    }

    if (!invite || invite.expiresAt < new Date()) {
      return { success: false, message: "Invite expired or invalid" };
    }
    if (invite.status === "ACCEPTED") {
      return { success: false, message: "Invite already accepted" };
    }

    invite.status = "PENDING_ADMIN";
    await invite.save();
    return {
      success: true,
      message: "Invite accepted. Awaiting admin approval.",
    };
  },
  async finalizeInvite(inviteId: string) {
    const invite = await PendingInvite.findById(inviteId);

    if (!invite || invite.status !== "PENDING_ADMIN") {
      throw new ApiError(400, "Invalid invite state");
    }
    const org = await Organization.findById(invite.orgId);
    if (!org) {
      throw new ApiError(404, "Organization not found");
    }
    if (org.Members?.includes(invite.userId)) {
      throw new ApiError(409, "User already exists in this organization");
    }
    org?.Members?.push(invite.userId);
    await org.save();

    invite.status = "ACCEPTED";
    invite.role = "mentor";
    await invite.save();

    return { success: true, message: "User successfully added to org." };
  },
};
