import { Schema, model, Types, Document } from "mongoose";

// ============================
// ✅ Question Model
// ============================
export interface IQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    points: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Question = model<IQuestion>("Question", questionSchema);