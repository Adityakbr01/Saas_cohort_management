import mongoose, { Schema, Document, Types } from "mongoose";
import { Model } from "mongoose";

// 1. Define TypeScript interface for strong typing
export interface IOrganization extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  slug: string;
  logo?: string;
  Members?: Types.ObjectId[] &
    {
      suspended: { isSuspended: boolean; suspendedAt: Date; reason: string };
    }[];
  createdAt: Date;
  updatedAt: Date;
  plan?: Types.ObjectId; // Reference to SubscriptionPlan
  subscriptionMeta: {
    startDate: Date; // Start date of the subscription,
    expiresDate: Date | null; // Nullable for plans that don't expire,
    isActive: boolean; // Indicates if the subscription is active
    isExpired: boolean; // Indicates if the subscription is expired
  };
  suspended: {
    isSuspended: boolean;
    suspendedAt: Date | null;
    reason: string;
  };
}

// 2. Define the Mongoose schema
const organizationSchema = new Schema<IOrganization>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: { type: String, required: true, select: false },
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
    logo: {
      type: String, // URL or path to logo image
      default: "",
    },
    Members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        suspended: {
          isSuspended: {
            type: Boolean,
            default: false,
          },
          suspendedAt: {
            type: Date,
            default: null,
          },
          reason: {
            type: String,
            default: "",
          },
        },
      },
    ],
    plan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false,
      default: null,
    },
    subscriptionMeta: {
      startDate: { type: Date, default: Date.now },
      expiresDate: { type: Date },
      isExpired: Boolean,
      isActive: Boolean,
    },
    suspended: {
      isSuspended: {
        type: Boolean,
        default: false,
      },
      suspendedAt: {
        type: Date,
        default: null,
      },
      reason: {
        type: String,
        default: "",
      },
    },
  },

  {
    timestamps: true, // Auto adds createdAt and updatedAt
  }
);

// 3. Create and export the model
const Organization = mongoose.model<IOrganization>(
  "Organizationa",
  organizationSchema
);
export default Organization;
