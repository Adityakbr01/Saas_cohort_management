// mentor.model.ts
import mongoose, { Schema, Model } from "mongoose";
import baseUserSchema, { IBaseUser } from "./base.model";
import { Types } from "mongoose";
import noteSchema from "./note.schema";

export interface IMentor extends IBaseUser {
  name: string;
  phone: string;
  lastActive: Date;
  orgId?: {
    org: Types.ObjectId;
    invitedBy: Types.ObjectId;
  };
  cohorts?: Types.ObjectId[];
  specialization: string;
  experience: string;
  bio: string;
  certifications: {
    name: string;
    issuer: string;
    date: Date;
  }[];
  skillsExpertise: string[];
  yearsOfExperience: number;
  availability: string[];
  teachingStyle: string;
  studentCapacity: number;
  currentStudents: number;
  rating: number;
  overallRating: number;
  studentCompletionRate: number;
  responseTime: string;
  studentsCount: number;
  cohortsCount: number;
  performanceTrends: {
    month: string;
    performance: number;
  }[];
  communicationHistory: {
    type: "email" | "meeting" | "call" | "other";
    title: string;
    date: Date;
    participants: string[];
    summary: string;
  }[];
  notes: {
    title: string;
    author: string;
    date: Date;
    type:
      | "general"
      | "performance"
      | "engagement"
      | "intervention"
      | "goal"
      | "other";
    content: string;
    tags: string[];
    visibility: "private" | "mentor" | "all";
    priority: "low" | "medium" | "high";
  }[];
}

interface IMentorModel extends Model<IMentor> {
  findByEmailWithPassword(email: string): Promise<IMentor | null>;
}

const mentorSchema = new Schema<IMentor>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    lastActive: { type: Date, default: Date.now },
    orgId: [
      {
        org: { type: Schema.Types.ObjectId, ref: "Organization" },
        invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    cohorts: [{ type: Schema.Types.ObjectId, ref: "Cohort" }],
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
    bio: { type: String, default: "" },
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
      },
    ],
    skillsExpertise: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    availability: [{ type: String }],
    teachingStyle: { type: String },
    studentCapacity: { type: Number, default: 0 },
    currentStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    overallRating: { type: Number, default: 4.9 },
    studentCompletionRate: { type: Number, default: 92 },
    responseTime: { type: String, default: "< 2 hours" },
    studentsCount: { type: Number, default: 0 },
    cohortsCount: { type: Number, default: 0 },
    performanceTrends: [
      {
        month: { type: String },
        performance: { type: Number },
      },
    ],
    communicationHistory: [
      {
        type: {
          type: String,
          enum: ["email", "meeting", "call", "other"],
          default: "other",
        },
        title: { type: String },
        date: { type: Date },
        participants: [{ type: String }],
        summary: { type: String },
      },
    ],
    notes: [noteSchema],
  },
  { timestamps: true }
);

// Combine base schema with mentor schema
mentorSchema.add(baseUserSchema);

// Set default role
mentorSchema.path("role").default("mentor");

const Mentor = mongoose.model<IMentor, IMentorModel>("Mentor", mentorSchema);
export default Mentor;