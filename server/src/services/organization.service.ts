import slugify from "slugify";
import mongoose from "mongoose";
import { ApiError } from "@/utils/apiError";
import { OrganizationDAO } from "@/dao/organization.dao";
import Organization from "@/models/organizationModel";
import { sendEmailToJoinOrganization, sendInviteEmail } from "./emailService";
import { findUserByEmail, UserDAO } from "@/dao/user.dao";
import PendingInvite from "@/models/PendingInvite";
import { generateInviteToken } from "@/utils/tokenUtil";
import Mentor from "@/models/mentorModel";

// Types for better type safety
interface MentorCreationData {
  email: string;
  userId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  role: string;
  invitedBy: mongoose.Types.ObjectId;
  status: string;
  token: string;
  expiresAt: Date;
  name: string;
  phone: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
  }>;
  rating: number;
  studentsCount: number;
  cohortsCount: number;
  lastActive: Date;
}

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
    role: "mentor";
    orgName: string;
    invitedBy: string;
    name: string;
    phone: string;
    specialization: string;
    experience: string;
    bio: string;
    certifications: string;
  }) {
    const {
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
    } = data;

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
      name,
      phone,
      specialization,
      experience,
      bio,
      certifications,
    });

    await sendInviteEmail({
      email,
      token,
      orgName,
      role,
      firstName: name,
      specialization,
      experience,
      bio,
      certifications,
    });
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
  async finalizeInvite(inviteId: string): Promise<{
    success: boolean;
    message: string;
    mentorId?: mongoose.Types.ObjectId;
    mentorEmail?: string;
  }> {
    console.log(`🚀 Starting finalizeInvite process for inviteId: ${inviteId}`);

    try {
      // Step 1: Validate and fetch invite
      console.log(`🔍 Fetching invite with ID: ${inviteId}`);
      const invite = await PendingInvite.findById(inviteId);

      if (!invite) {
        console.error(`❌ Invite not found with ID: ${inviteId}`);
        throw new ApiError(404, "Invite not found");
      }

      if (invite.status !== "PENDING_ADMIN") {
        console.error(`❌ Invalid invite state. Expected: PENDING_ADMIN or PENDING_USER, Got: ${invite.status}`);
        throw new ApiError(400, `Invalid invite state: ${invite.status}. Expected: PENDING_ADMIN`);
      }

      console.log(`✅ Invite found and validated:`, {
        email: invite.email,
        orgId: invite.orgId,
        status: invite.status,
        role: invite.role
      });

      // Step 2: Validate and fetch organization
      console.log(`🏢 Fetching organization with ID: ${invite.orgId}`);
      const org = await Organization.findById(invite.orgId);

      if (!org) {
        console.error(`❌ Organization not found with ID: ${invite.orgId}`);
        throw new ApiError(404, "Organization not found");
      }

      console.log(`✅ Organization found: ${org.name} (ID: ${org._id})`);

      // Step 3: Check if user is already a member (only if invite status is PENDING_ADMIN)
      if (invite.status === "PENDING_ADMIN" && invite.userId && org.Members?.includes(invite.userId)) {
        console.error(`❌ User ${invite.userId} already exists in organization ${org._id}`);
        throw new ApiError(409, "User already exists in this organization");
      }

      // Step 4: Validate required fields for mentor creation
      console.log(`🔍 Validating mentor data before creation`);
      const validationErrors = validateMentorData(invite);

      if (validationErrors.length > 0) {
        console.error(`❌ Mentor data validation failed:`, validationErrors);
        throw new ApiError(400, `Mentor data validation failed: ${validationErrors.join(', ')}`);
      }

      console.log(`✅ Mentor data validation passed`);

      // Step 5: Check for existing mentor with same email in organization
      console.log(`🔍 Checking for existing mentor with email: ${invite.email} in org: ${invite.orgId}`);
      const existingMentor = await Mentor.findOne({
        email: invite.email,
        orgId: invite.orgId
      });

      if (existingMentor) {
        console.error(`❌ Mentor already exists with email ${invite.email} in organization ${invite.orgId}`);
        throw new ApiError(409, "Mentor with this email already exists in the organization");
      }

      // Step 6: Prepare mentor data with proper type conversion
      console.log(`🔧 Preparing mentor data for creation`);
      const mentorData = prepareMentorData(invite);
      console.log(`✅ Mentor data prepared:`, {
        email: mentorData.email,
        name: mentorData.name,
        specialization: mentorData.specialization,
        certificationsCount: mentorData.certifications.length
      });

      // Step 7: Create mentor record
      console.log(`👨‍🏫 Creating mentor record`);
      const newMentor = await Mentor.create(mentorData);

      if (!newMentor) {
        console.error(`❌ Failed to create mentor record`);
        throw new ApiError(500, "Failed to create mentor record");
      }

      console.log(`✅ Mentor created successfully:`, {
        mentorId: newMentor._id,
        email: newMentor.email,
        name: newMentor.name
      });

      // Step 8: Update organization membership
      console.log(`🏢 Adding user to organization members`);
      if (invite.userId) {
        if (!org.Members) {
          org.Members = [];
        }
        org.Members.push(invite.userId);
        await org.save();
        console.log(`✅ User ${invite.userId} added to organization ${org._id}`);
      }

      // Step 9: Update invite status
      console.log(`📝 Updating invite status to ACCEPTED`);
      invite.status = "ACCEPTED";
      invite.role = "mentor";
      await invite.save();
      console.log(`✅ Invite status updated to ACCEPTED`);

      console.log(`🎉 finalizeInvite completed successfully for invite: ${inviteId}`);
      return {
        success: true,
        message: "Mentor successfully added to organization",
        mentorId: newMentor._id,
        mentorEmail: newMentor.email
      };

    } catch (error) {
      // Re-throw ApiError as-is, wrap other errors
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(
          500,
          `Failed to finalize invite: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  },
};

/**
 * Validates mentor data before creation
 * @param invite - The pending invite object
 * @returns Array of validation error messages
 */
function validateMentorData(invite: any): string[] {
  const errors: string[] = [];

  // Required fields validation
  if (!invite.email || typeof invite.email !== 'string' || !invite.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!invite.name || typeof invite.name !== 'string' || invite.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!invite.phone || typeof invite.phone !== 'string' || invite.phone.trim().length === 0) {
    errors.push('Phone is required');
  }

  if (!invite.specialization || typeof invite.specialization !== 'string' || invite.specialization.trim().length === 0) {
    errors.push('Specialization is required');
  }

  if (!invite.experience || typeof invite.experience !== 'string' || invite.experience.trim().length === 0) {
    errors.push('Experience is required');
  }

  if (!invite.orgId) {
    errors.push('Organization ID is required');
  }

  if (!invite.invitedBy) {
    errors.push('InvitedBy user ID is required');
  }

  if (!invite.token || typeof invite.token !== 'string' || invite.token.trim().length === 0) {
    errors.push('Token is required');
  }

  if (!invite.expiresAt || !(invite.expiresAt instanceof Date)) {
    errors.push('Valid expiration date is required');
  }

  // Optional field validation (if provided, must be valid)
  if (invite.bio && typeof invite.bio !== 'string') {
    errors.push('Bio must be a string');
  }

  if (invite.certifications && typeof invite.certifications !== 'string') {
    errors.push('Certifications must be a string');
  }

  return errors;
}

/**
 * Prepares mentor data for creation with proper type conversion
 * @param invite - The pending invite object
 * @returns Properly formatted mentor data
 */
function prepareMentorData(invite: any): MentorCreationData {
  // Parse certifications from string to array format
  let certificationsArray: Array<{ name: string; issuer: string; date: Date }> = [];

  if (invite.certifications && typeof invite.certifications === 'string') {
    try {
      // Remove extra quotes if present and clean the string
      let cleanCertifications = invite.certifications.trim();

      // Remove surrounding single or double quotes
      if ((cleanCertifications.startsWith("'") && cleanCertifications.endsWith("'")) ||
          (cleanCertifications.startsWith('"') && cleanCertifications.endsWith('"'))) {
        cleanCertifications = cleanCertifications.slice(1, -1);
      }

      // Split comma-separated certifications and create objects
      const certNames = cleanCertifications.split(',').map((cert: string) => cert.trim()).filter((cert: string) => cert.length > 0);
      certificationsArray = certNames.map((name: string) => ({
        name,
        issuer: 'Self-reported', // Default issuer
        date: new Date() // Default to current date
      }));

      console.log(`✅ Parsed ${certificationsArray.length} certifications:`, certificationsArray.map(c => c.name));
    } catch (error) {
      console.warn(`⚠️ Failed to parse certifications: ${invite.certifications}`, error);
      // Keep empty array as fallback
    }
  }

  return {
    email: invite.email.toLowerCase().trim(),
    userId: invite.userId,
    orgId: invite.orgId,
    role: invite.role || 'mentor',
    invitedBy: invite.invitedBy,
    status: 'ACCEPTED',
    token: invite.token,
    expiresAt: invite.expiresAt,
    name: invite.name.trim(),
    phone: invite.phone.trim(),
    specialization: invite.specialization.trim(),
    experience: invite.experience.trim(),
    bio: invite.bio ? invite.bio.trim() : '',
    certifications: certificationsArray,
    rating: 0, // Default rating
    studentsCount: 0, // Default student count
    cohortsCount: 0, // Default cohort count
    lastActive: new Date() // Set to current time
  };
}
