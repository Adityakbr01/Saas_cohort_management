import mongoose from "mongoose";

interface IMentor extends Document {
  email: string;
  userId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  role: string;
  invitedBy: mongoose.Types.ObjectId;
  status: string;
  token: string;
  expiresAt: Date;
  name: string;
  phone: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: object[];
  rating: number;
  studentsCount: number;
  cohortsCount: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}
const mentorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      default: "mentor",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_USER", "PENDING_ADMIN", "ACCEPTED", "REJECTED"],
      default: "PENDING_USER",
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    certifications: {
      type: [
        {
          name: String,
          issuer: String,
          date: Date,
        },
      ],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    cohortsCount: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
// Create and export the Mentor model
const Mentor = mongoose.model<IMentor>("Mentor", mentorSchema);
export default Mentor;
