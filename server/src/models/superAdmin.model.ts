// backend/models/superAdmin.model.ts
import mongoose, { Schema, Model } from "mongoose";
import baseUserSchema, { IBaseUser } from "./base.model";

export interface ISuperAdmin extends IBaseUser {
  adminPrivileges: string[];
  name: string;
  role: "super_admin";
  isMasterAdmin: boolean;
  isVerifiedByAdmin: boolean;
}

interface ISuperAdminModel extends Model<ISuperAdmin> {
  findByEmailWithPassword(email: string): Promise<ISuperAdmin | null>;
}

const superAdminSchema = new Schema<ISuperAdmin>({
  adminPrivileges: {
    type: [String],
    required: true,
    enum: [
      "manage_users",
      "manage_cohorts",
      "view_analytics",
      "manage_billing",
    ],
    default: ["manage_users", "manage_cohorts"],
  },

  role: {
    type: String,
    default: "super_admin",
  },
  isMasterAdmin: {
    type: Boolean,
    default: false,
  },
  name: { type: String, required: true, trim: true },
  isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },

});

// Combine base schema with mentor schema
superAdminSchema.add(baseUserSchema);

// Set default role
superAdminSchema.path("role").default("super_admin");

const SuperAdmin = mongoose.model<ISuperAdmin, ISuperAdminModel>(
  "SuperAdmin",
  superAdminSchema
);

export default SuperAdmin;
