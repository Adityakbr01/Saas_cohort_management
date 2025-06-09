import Organization from "@/models/organizationModel";
import User from "@/models/userModel";
import { ApiError } from "@/utils/apiError";

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
    const existingOrgUser = Organization.findOne({ ownerId: userId });
    return existingOrgUser;
  },

  async findAllOrgs(excludeOwnerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      Organization.find({ ownerId: { $ne: excludeOwnerId } })
        .populate("ownerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Organization.countDocuments({ ownerId: { $ne: excludeOwnerId } }),
    ]);

    return {
      data: organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Fetch organization by ID
  async findOrgWithPaginatedMembers(
    orgId: string,
    page: number,
    limit: number
  ) {
    const organization = await Organization.findById(orgId)
      .populate("ownerId", "name email role") // Select only necessary fields
      .lean();

    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }

    const skip = (page - 1) * limit;

    // Exclude ownerId from members
    const filteredMemberIds =
      organization.Members?.filter(
        (memberId) => memberId.toString() !== organization.ownerId?.toString()
      ) || [];

    const members = await User.find({ _id: { $in: filteredMemberIds } })
      .select("name email role") // avoid sensitive fields
      .skip(skip)
      .limit(limit)
      .lean();

    const totalMembers = filteredMemberIds.length;
    const totalPages = Math.ceil(totalMembers / limit);

    return {
      organization: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        ownerId: organization.ownerId,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      members,
      totalMembers,
      page,
      totalPages,
    };
  },
};
