// ============================
// ✅ Quiz Model
// ============================
import { Schema, model, Types, Document } from "mongoose";

export interface IQuiz extends Document {
  title: string;
  description: string;
  lesson: Types.ObjectId;
  questions: Types.ObjectId[];
  totalPoints: number;
  dueDate?: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    totalPoints: { type: Number, default: 0 },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("Quiz", quizSchema);
