import slugify from "slugify";
import { ApiError } from "@/utils/apiError";
import { OrganizationDAO } from "@/dao/organization.dao";
import Organization from "@/models/organizationModel";

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
async getAllOrg({ userId, page, limit }: { userId: string, page: number, limit: number }) {
  return OrganizationDAO.findAllOrgs(userId, page, limit);
}
,

 async getOrgUsers({ orgId, page, limit }: { orgId: string; page: number; limit: number }) {
  return OrganizationDAO.findOrgWithPaginatedMembers(orgId, page, limit);
}
};
