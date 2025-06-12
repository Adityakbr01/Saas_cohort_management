import User, { IUser } from "@/models/userModel";
import mongoose, { Types } from "mongoose";



interface SubscriptionMeta {
  startDate: Date;
  expiresDate: Date;
  isActive: boolean;
  isExpired: boolean;
}


export const findAllUsers = () => User.find().select("-password");

export const findUserById = (id: string) =>
  User.findById(id).select("-password");

export const createUserInDB = (data: {
  name: string;
  email: string;
  password: string;
}) => User.create(data);

export const updateUserById = (
  id: string,
  data: Partial<{ name: string; email: string }>
) => User.findByIdAndUpdate(id, data, { new: true }).select("-password");

export const deleteUserById = (id: string) => User.findByIdAndDelete(id);

export const findUserByEmail = (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).select("+password") as Promise<IUser | null>;
};
interface UserInput {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "mentor" | "student" | "org_admin";
  organization?: Types.ObjectId;
  profile: {
    bio: string;
    skills: string[];
    xp: number;
    streak: number;
  };
}

export const createUser = async (userData: UserInput): Promise<IUser> => {
  const user = await User.create(userData);
  return user;
};
export const UserDAO = {
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findByEmailWithPassword(email);
  },
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  },

  async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  },

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      {
        name: updates.name,
        profile: updates.profile,
      },
      { new: true }
    );
  },

  storeRefreshToken: async (userId: string, refreshToken: string) => {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return await User.findByIdAndUpdate(
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
    return await User.findByIdAndUpdate(
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
  async updateUserOTP(user: IUser, otp?: string, otpExpiry?: Date) {
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
 async  updateUserPlan(
  userId: string,
  planId: mongoose.Types.ObjectId,
  subscriptionMeta: SubscriptionMeta
) {
  return await User.findByIdAndUpdate(
    userId,
    {
      plan: planId,
      subscriptionMeta,
    },
    { new: true }
  );
}
};
