// models/CohortEnrollment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICohortEnrollment extends Document {
  user: mongoose.Types.ObjectId;
  cohort: mongoose.Types.ObjectId;
  enrolledAt: Date;
  isPaid: boolean;
  paymentId: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentStatus: string;
  paymentDetails: Object;
}

const CohortEnrollmentSchema = new Schema<ICohortEnrollment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  cohort: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
  enrolledAt: { type: Date, default: Date.now },
  isPaid: { type: Boolean, default: false },
  paymentId: { type: String, default: "" },
  paymentMethod: { type: String, default: "" },
  paymentAmount: { type: Number, default: 0 },
  paymentDate: { type: Date, default: null },
  paymentStatus: { type: String, default: "" },
  paymentDetails: { type: Object, default: {} },

});

export const CohortEnrollment = mongoose.model<ICohortEnrollment>('CohortEnrollment', CohortEnrollmentSchema);
