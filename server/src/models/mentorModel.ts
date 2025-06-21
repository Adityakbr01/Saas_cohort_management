import mongoose, { Document, Schema } from "mongoose";

interface IMentor extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  token: string;
  expiresAt: Date;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  lastActive: Date;

  orgId: {
    org: mongoose.Types.ObjectId;
    invitedBy: mongoose.Types.ObjectId;
  };
  cohorts: mongoose.Types.ObjectId[];

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

  tokenVersion: number;
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }>;

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

  createdAt: Date;
  updatedAt: Date;
}

const mentorSchema = new Schema<IMentor>(
  {
    // Auth & Personal Info
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    role: { type: String, default: "mentor" },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    lastActive: { type: Date, default: Date.now },

    // Org & Cohort
    orgId: {
      org: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
      invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    cohorts: [{ type: Schema.Types.ObjectId, ref: "Cohort" }],

    // Professional Info
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

    // Stats
    rating: { type: Number, default: 0 },
    overallRating: { type: Number, default: 4.9 }, // e.g., "Overall Rating: 4.9 / 5.0"
    studentCompletionRate: { type: Number, default: 92 }, // e.g., "92%"
    responseTime: { type: String, default: "< 2 hours" }, // e.g., "< 2 hours"
    studentsCount: { type: Number, default: 0 },
    cohortsCount: { type: Number, default: 0 },

    // Tokens
    tokenVersion: { type: Number, default: 0 },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Performance Trends
    performanceTrends: [
      {
        month: { type: String },
        performance: { type: Number },
      },
    ],

    // Communication Logs
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

    // Mentor Notes
    notes: [
      {
        title: { type: String, default: "" },
        author: { type: String, required: true },
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: [
            "general",
            "performance",
            "engagement",
            "intervention",
            "goal",
            "other",
          ],
          default: "general",
        },
        content: { type: String, default: "" },
        tags: [{ type: String }],
        visibility: {
          type: String,
          enum: ["private", "mentor", "all"],
          default: "mentor",
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "low",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Mentor = mongoose.model<IMentor>("Mentor", mentorSchema);
export default Mentor;
