import Organization from "@/models/organizationModel";

export const OrganizationDAO = {
  async findBySlug(slug: string) {
    return Organization.findOne({ slug });
  },

  async createOrg(data: {
    name: string;
    slug: string;
    logo?: string;
    ownerId?: string;
  }) {
    return Organization.create(data);
  },

  async findOrgByUserId(userId: string) {
   const existingOrgUser =  Organization.findOne({ ownerId: userId });
   return existingOrgUser
  },
};
