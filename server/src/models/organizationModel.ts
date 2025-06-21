import mongoose, { Schema, Document } from "mongoose";

// 1. Define TypeScript interface for strong typing
export interface IOrganization extends Document {
  name: string;
  slug: string;
  ownerId?: mongoose.Types.ObjectId;
  logo?: string;
  Members?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Mongoose schema
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
    logo: {
      type: String, // URL or path to logo image
      default: "",
    },
    Members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    timestamps: true, // Auto adds createdAt and updatedAt
  }
);

// 3. Create and export the model
const Organization = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);
export default Organization;
