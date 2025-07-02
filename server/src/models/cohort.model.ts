import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICohort extends Document {
  title: string;
  shortDescription: string;
  description: string;
  mentor: Types.ObjectId;
  organization: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
  status: "active" | "completed" | "upcoming";
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  students: Types.ObjectId[];
  createdBy: Types.ObjectId;
  schedule: string;
  location: string;
  progress: number;
  completionRate: number;
  language: string;
  tags: string[];
  prerequisites: string[];
  certificateAvailable: boolean;
  chapters: Types.ObjectId[];
  isPrivate: boolean;
  isDeleted: boolean;
  demoVideo: string;
  Thumbnail: string;
}

const cohortSchema = new Schema<ICohort>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    mentor: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxCapacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "upcoming"],
      default: "upcoming",
    },
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    schedule: { type: String, required: true },
    location: { type: String, required: true },
    progress: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    tags: [{ type: String }],
    prerequisites: [{ type: String }],
    certificateAvailable: { type: Boolean, default: false },
    chapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    isPrivate: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    demoVideo: { type: String, default: "" },
    Thumbnail: { type: String, default: "" },

  },
  { timestamps: true }
);

export const Cohort = mongoose.model<ICohort>("Cohort", cohortSchema);
