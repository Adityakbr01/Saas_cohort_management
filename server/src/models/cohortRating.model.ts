// models/CohortRating.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICohortRating extends Document {
  _id: Types.ObjectId;
  cohortId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userAvatar: string;
  userRole: "student" | "mentor" | "organization";
  rating: number; // 1 to 5
  review: string; 
  createdAt: Date;
}

const cohortRatingSchema = new Schema<ICohortRating>(
  {
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
    userId: { type: Schema.Types.ObjectId,required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    userRole: { type: String, enum: ["student", "mentor", "organization"], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

cohortRatingSchema.index({ cohortId: 1, userId: 1 }, { unique: true });

export const CohortRating = mongoose.model<ICohortRating>("CohortRating", cohortRatingSchema);
