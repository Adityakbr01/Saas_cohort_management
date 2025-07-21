// models/CohortLike.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICohortLike extends Document {
  cohortId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const cohortLikeSchema = new Schema<ICohortLike>(
  {
    cohortId: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

cohortLikeSchema.index({ cohortId: 1, userId: 1 }, { unique: true });

export const CohortLike = mongoose.model<ICohortLike>("CohortLike", cohortLikeSchema);
