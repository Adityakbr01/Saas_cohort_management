// models/CohortRating.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICohortRating extends Document {
  _id: Types.ObjectId;
  cohortId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // 1 to 5
  createdAt: Date;
}

const cohortRatingSchema = new Schema<ICohortRating>(
  {
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

cohortRatingSchema.index({ cohortId: 1, userId: 1 }, { unique: true });

export const CohortRating = mongoose.model<ICohortRating>("CohortRating", cohortRatingSchema);
