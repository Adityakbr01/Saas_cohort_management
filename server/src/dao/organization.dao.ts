import Organization from "@/models/organizationMode";

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
};
