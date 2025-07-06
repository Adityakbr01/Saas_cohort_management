import { env_config } from "@/configs/env";
import { Role } from "@/configs/roleConfig";
import { Cohort } from "@/models/cohort.model";
import Mentor from "@/models/mentor.model";
import Organization from "@/models/organization.model";
import PendingInvite from "@/models/PendingInvite";
import { ApiError } from "@/utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

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


export const MentorService = {
  async acceptInviteMentor({ token }: { token: string }) {
    if (!token) {
      throw new ApiError(400, "Token is missing");
    }

    let decoded: InviteTokenPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as InviteTokenPayload;
    } catch (err) {
      throw new ApiError(401, "Invalid or expired token");
    }

    const { email, orgId, role } = decoded;

    const invite = await PendingInvite.findOne({ email, orgId });
    if (!invite) throw new ApiError(404, "Invite not found");

    if (["ACCEPTED", "REJECTED", "PENDING_ADMIN"].includes(invite.status)) {
      throw new ApiError(400, `Invite cannot be accepted (status: ${invite.status})`);
    }

    const org = await Organization.findById(orgId);
    if (!org) throw new ApiError(404, "Organization not found");

    const mentor = await Mentor.findOne({ email });
    if (!mentor) throw new ApiError(404, "Mentor not found");

    const isAlreadyMember = org.Members?.some((member: any) =>
      new Types.ObjectId(member.user).equals(mentor._id)
    );
    if (isAlreadyMember) {
      throw new ApiError(400, "Mentor is already a member of this organization");
    }

    // Update invite status
    invite.status = role === Role.mentor ? "PENDING_ADMIN" : "ACCEPTED";
    await invite.save();

    const redirectUrl = `${env_config.Fronted_URL}?success=true&message=Invite accepted successfully, wait for admin approval`;

    return { redirectUrl };
  },
  async getMyOrganizations(userId: string) {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const objectId = new Types.ObjectId(userId);

    const orgs = await Organization.find({
      Members: { $elemMatch: { user: objectId } },
    })
      .select(
        "_id name slug logo email isVerified isActive plan createdAt updatedAt"
      )
      .populate({
        path: "Members",
        select: "user",
      });

    return orgs.map((org) => ({
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
  },
  async getMentorCohorts(userId: string, page: number, limit: number) {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const skip = (page - 1) * limit;
    const query = { mentor: userId, isDeleted: false };

    const [cohorts, total] = await Promise.all([
      Cohort.find(query)
        .populate("mentor organization")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Cohort.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };

    return {
      cohorts,
      pagination: paginationInfo,
      meta: {
        totalCohorts: total,
        shownCohorts: cohorts.length,
        currentPage: page, itemsPerPage: limit,
      },
    };
  },
};

