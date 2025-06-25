import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IMentor extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
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

  tokenVersion: number;
  refreshToken?: {
    token: string;
    expiresAt: Date;
    createdAt: Date;
  };

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


   // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  invalidateAllTokens(): Promise<void>;
}



interface IMentorModel extends mongoose.Model<IMentor> {
  findByEmailWithPassword(email: string): Promise<IMentor | null>;
}

const mentorSchema = new Schema<IMentor>(
  {
    // Auth & Personal Info
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    role: { type: String, default: "mentor" },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    lastActive: { type: Date, default: Date.now },

    // Org & Cohort
    orgId: [
      {
        org: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
          required: false,
        },
        invitedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
      },
    ],
    cohorts: [{ type: Schema.Types.ObjectId, ref: "Cohort", required: false }],

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
    refreshToken: {
      token: { type: String },
      expiresAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
    },

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

// Pre-save hash
mentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
mentorSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

mentorSchema.methods.generateAuthToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    role: "student", // Fixed: added role since it was referenced but not defined
    tokenVersion: this.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "12h",
  });
};

mentorSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    tokenVersion: this.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

mentorSchema.methods.invalidateAllTokens = async function (): Promise<void> {
  this.tokenVersion += 1;
  this.refreshToken = undefined; // Clear the single refresh token
  await this.save();
};

// Static method
mentorSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select(
    "+password +otp +otpExpiry +refreshToken +tokenVersion"
  );
};

const Mentor = mongoose.model<IMentor, IMentorModel>("Meantor", mentorSchema);
export default Mentor;
