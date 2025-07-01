// organization.model.ts
import mongoose, { Schema, Model } from "mongoose";
import baseUserSchema, { IBaseUser } from "./base.model";
import { Types } from "mongoose";

interface IMember {
  user: Types.ObjectId;
  suspended: {
    isSuspended: boolean;
    suspendedAt: Date | null;
    reason: string;
  };
  joinDate: Date;
}
export interface IOrganization extends IBaseUser {
  name: string;
  slug: string;
  logo?: string;
  Members?: IMember[];
  plan?: Types.ObjectId;
  subscriptionMeta: {
    startDate: Date;
    expiresDate: Date | null;
    isActive: boolean;
    isExpired: boolean;
    maxStudents: number;
    maxMentors: number;
    maxCourses: number;
  };
}

interface IOrganizationModel extends Model<IOrganization> {
  findByEmailWithPassword(email: string): Promise<IOrganization | null>;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: { type: String, default: "" },
    Members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
        suspended: {
          isSuspended: { type: Boolean, default: false },
          suspendedAt: { type: Date, default: null },
          reason: { type: String, default: "" },
        },
        joinDate: { type: Date, default: Date.now },
      },
    ],
    plan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionMeta: {
      startDate: { type: Date, default: Date.now },
      expiresDate: { type: Date },
      isExpired: Boolean,
      isActive: Boolean,
      maxStudents: Number,
      maxMentors: Number,
      maxCourses: Number,
    },
  },
  { timestamps: true }
);

// Combine base schema with organization schema
organizationSchema.add(baseUserSchema);

// Set default role
organizationSchema.path("role").default("organization");

const Organization = mongoose.model<IOrganization, IOrganizationModel>(
  "Organization",
  organizationSchema
);
export default Organization;
