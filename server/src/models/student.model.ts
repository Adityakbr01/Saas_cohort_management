// student.model.ts
import mongoose, { Schema, Model } from "mongoose";
import baseUserSchema, { IBaseUser } from "./base.model";
import { Types } from "mongoose";
import noteSchema from "./note.schema";

export interface IStudent extends IBaseUser {
  cohorts: Types.ObjectId[];
  name: string;
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
      week: Number;
      progress: number;
      engagement: number;
      attendance: number;
    }>;
    skillProgress: Array<{
      skill: string;
      level: number;
    }>;
  };
  enrolledCourses: Types.ObjectId[];
  certificates: Array<{
    title: string;
    issueDate: Date;
    instructor: Types.ObjectId;
  }>;
  profileImageUrl: string;
}

interface IStudentModel extends Model<IStudent> {
  findByEmailWithPassword(email: string): Promise<IStudent | null>;
}

const studentSchema = new Schema<IStudent>(
  {
    cohorts: [{ type: Schema.Types.ObjectId, ref: "Cohort" }],
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    grade: {
      type: String,
      default: "N/A",
      enum: [
        "A",
        "A-",
        "B+",
        "B",
        "B-",
        "C+",
        "C",
        "C-",
        "D+",
        "D",
        "D-",
        "F",
        "N/A",
      ],
    },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    attendanceRate: { type: Number, default: 0, min: 0, max: 100 },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 },
    lastActive: { type: Date },
    lastSubmission: { type: Date },
    bio: { type: String, default: "" },
    goals: { type: String, default: "" },
    learningStyle: { type: String, default: "" },
    timezone: { type: String, required: false },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
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
    notes: [noteSchema],
    sessionAttendance: { type: Number, default: 0, min: 0 },
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
          required: true,
        },
        title: { type: String, required: true },
        date: { type: Date, default: Date.now },
        from: { type: String, required: true },
        content: { type: String, required: true },
      },
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
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    certificates: [
      {
        title: { type: String, required: true },
        issueDate: { type: Date, required: true },
        instructor: { type: Schema.Types.ObjectId, required: true },
      },
    ],
    profileImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Combine base schema with student schema
studentSchema.add(baseUserSchema);

// Set default role
studentSchema.path("role").default("student");

// Indexes
studentSchema.index({ userId: 1, orgId: 1 });
studentSchema.index({ cohortId: 1 });
studentSchema.index({ mentorId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isActive: 1 });

const Student = mongoose.model<IStudent, IStudentModel>(
  "Student",
  studentSchema
);
export default Student;
