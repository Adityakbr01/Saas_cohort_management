import Student, { IStudent } from "@/models/student";
import User, { IUser } from "@/models/userModel";
import { Console } from "console";
import mongoose, { Types } from "mongoose";

export const StudentDAO = {
  async findByEmailWithPassword(email: string): Promise<IStudent | null> {
    return Student.findByEmailWithPassword(email);
  },
  async createStudent(data: Partial<IStudent>): Promise<IStudent> {
    const user = new Student(data);
    return user.save();
  },

  async findById(userId: string): Promise<IUser | null> {
    return Student.findById(userId);
  },
  async getProfileById(userId: string): Promise<IUser | null> {
    try {
      const user = await Student.findById(userId)
        .select("-refreshTokens")
        .lean();

      return user as IUser | null;
    } catch (error) {
      console.error("Error in getProfileById:", error);
      return null;
    }
  },
  storeRefreshToken: async (userId: string, refreshToken: string) => {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return await Student.findByIdAndUpdate(
      userId,
      {
        $push: {
          refreshTokens: {
            token: refreshToken,
            expiresAt,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  },
  invalidateAllTokens: async (userId: string) => {
    return await Student.findByIdAndUpdate(
      userId,
      {
        $inc: { tokenVersion: 1 },
        $set: { refreshTokens: [] },
      },
      { new: true }
    );
  },
  async getAllUsers({ role }: { role?: string }): Promise<IUser[]> {
    const filter: any = {};

    // Example: filter multiple roles using $or
    if (role) {
      const roles = Array.isArray(role) ? role : [role];
      filter.$or = roles.map((r) => ({ role: r }));
    }

    return User.find(filter).select("-password");
  },
  async deleteUser(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  },
  async updateRole(userId: string, newRole: string) {
    return User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry -refreshTokens -tokenVersion");
  },
  async updateUserOTP(user: IStudent, otp?: string, otpExpiry?: Date) {
    const existingUser = await this.findById(user._id.toString());
    if (!existingUser) {
      throw new Error("User not found");
    }

    if (!otp || !otpExpiry) {
      existingUser.otp = undefined;
      existingUser.otpExpiry = undefined;
    } else {
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
    }

    return await existingUser.save();
  },
  async updateUserPlan(userId: string, planId: mongoose.Types.ObjectId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        plan: planId,
      },
      { new: true }
    );
  },
  async updateProfile(id: string, updates: Partial<IStudent>): Promise<any> {
    const $set: any = {};

    if (updates.name) $set.name = updates.name;
    if (updates.phone) $set.phone = updates.phone;
    if (updates.bio) $set.bio = updates.bio;
    if (updates.goals) $set.goals = updates.goals;

    if (updates.background) {
      $set.background = {};
      if (updates.background.education)
        $set.background.education = updates.background.education;
      if (updates.background.experience)
        $set.background.experience = updates.background.experience;
      if (updates.background.learningGoals)
        $set.background.learningGoals = updates.background.learningGoals;
      if (updates.background.skills)
        $set.background.skills = updates.background.skills;
    }
    const updatedProfile = await Student.findByIdAndUpdate(
      id,
      { $set },
      { new: true }
    );
    if (!updatedProfile) {
      throw new Error("User not found");
    }
    return {
      id: updatedProfile._id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      role: updatedProfile.role,
      isVerified: updatedProfile.isVerified,
      lastLogin: updatedProfile.lastLogin || new Date(),
    };
  },
};
