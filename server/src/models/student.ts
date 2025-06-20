import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IStudent extends Document {
  cohortId: Types.ObjectId;
  mentorId?: Types.ObjectId;
  userId?: Types.ObjectId;
  orgId?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  grade: string;
  overallProgress: number;
  attendanceRate: number;
  engagementScore: number;
  lastActive: Date;
  lastSubmission: Date;
  bio: string;
  goals: string;
  learningStyle: string;
  timezone: string;
  xp: number;
  streak: number;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  isActive: boolean;
  lastLogin?: Date;
  tokenVersion: number;
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  background: {
    education: string;
    previousCourses: string[];
    experience: string;
    skills: Array<{
      name: string;
      progress: number;
    }>;
    learningGoals: string;
  };
  assignments: {
    completed: number;
    total: number;
    details: Array<{
      title: string;
      dueDate?: Date;
      submittedDate?: Date;
      status: "completed" | "in-progress" | "overdue";
      score: number;
      feedback: string;
      timeSpent: string;
      attempts: number;
    }>;
  };
  notes: Array<{
    title: string;
    author: string;
    date: Date;
    type: "general" | "performance" | "engagement" | "intervention" | "goal" | "other";
    content: string;
    tags: string[];
    visibility: "private" | "mentor" | "all";
    priority: "low" | "medium" | "high";
  }>;
  sessionAttendance: number;
  attendanceHistory: Array<{
    date: Date;
    status: "present" | "absent" | "late";
    duration: number;
    notes: string;
  }>;
  interactions: Array<{
    type: "message" | "forum_post" | "office_hours";
    title: string;
    date: Date;
    from: string;
    content: string;
  }>;
  performanceMetrics: {
    weeklyProgress: Array<{
      week: number;
      progress: number;
      engagement: number;
      attendance: number;
    }>;
    skillProgress: Array<{
      skill: string;
      level: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  invalidateAllTokens(): Promise<void>;
}

interface IStudentModel extends mongoose.Model<IStudent> {
  findByEmailWithPassword(email: string): Promise<IStudent | null>;
}

// Define the Mongoose schema
const studentSchema = new Schema<IStudent>(
  {
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "Mentor" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization" },
    name: { type: String, required: true, trim: true },
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
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    grade: {
      type: String,
      default: "N/A",
      enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "N/A"],
    },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    attendanceRate: { type: Number, default: 0, min: 0, max: 100 },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 },
    lastActive: { type: Date },
    lastSubmission: { type: Date },
    bio: { type: String, default: "" },
    goals: { type: String, default: "" },
    learningStyle: { type: String, default: "" },
    timezone: { type: String, required: true },
    background: {
      education: { type: String, default: "" },
      previousCourses: [{ type: String }],
      experience: { type: String, default: "" },
      skills: [
        {
          name: { type: String, default: "" },
          progress: { type: Number, default: 0, max: 100, min: 0 },
        },
      ],
      learningGoals: { type: String, default: "" },
    },
    assignments: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      details: [
        {
          title: { type: String, default: "" },
          dueDate: { type: Date },
          submittedDate: { type: Date },
          status: {
            type: String,
            enum: ["completed", "in-progress", "overdue"],
            default: "in-progress",
          },
          score: { type: Number, default: 0 },
          feedback: { type: String, default: "" },
          timeSpent: { type: String, default: "" },
          attempts: { type: Number, default: 0 },
        },
      ],
    },

    notes: [
      {
        title: { type: String, default: "" },
        author: { type: String, required: true },
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["general", "performance", "engagement", "intervention", "goal", "other"],
          default: "general",
        },
        content: { type: String, default: "" },
        tags: [{ type: String }],
        visibility: {
          type: String,
          enum: ["private", "mentor", "all"],
          default: "mentor"
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "low",
        },
      },
    ],

    sessionAttendance: {
      type: Number,
      default: 0,
      min: 0,
    },

    attendanceHistory: [
      {
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          required: true,
          enum: ["present", "absent", "late"],
          default: "present",
        },
        duration: { type: Number, default: 0 },
        notes: { type: String, default: "" },
      },
    ],

    interactions: [
      {
        type: {
          type: String,
          enum: ["message", "forum_post", "office_hours"],
          required: true
        },
        title: { type: String, required: true },
        date: { type: Date, default: Date.now },
        from: { type: String, required: true },
        content: { type: String, required: true }
      }
    ],

    performanceMetrics: {
      weeklyProgress: [
        {
          week: { type: Number, default: 0 },
          progress: { type: Number, default: 0, max: 100, min: 0 },
          engagement: { type: Number, default: 0, max: 100, min: 0 },
          attendance: { type: Number, default: 0, max: 100, min: 0 },
        },
      ],
      skillProgress: [
        {
          skill: { type: String, default: "" },
          level: { type: Number, default: 0, max: 100, min: 0 },
        },
      ],
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
studentSchema.index({ userId: 1, orgId: 1 });
studentSchema.index({ cohortId: 1 });
studentSchema.index({ mentorId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isActive: 1 });

// Pre-save hash
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
studentSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

studentSchema.methods.generateAuthToken = function (): string {
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

studentSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    tokenVersion: this.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

studentSchema.methods.invalidateAllTokens = async function (): Promise<void> {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  await this.save();
};

// Static method
studentSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select(
    "+password +otp +otpExpiry +refreshTokens"
  );
};

// Create and export the model
const Student = mongoose.model<IStudent, IStudentModel>("Student", studentSchema);
export default Student;
