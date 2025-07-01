import mongoose, { Document, Schema } from "mongoose";

interface IQuiz extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const quizSchema = new Schema<IQuiz>(
  {
    question: { type: String, required: true },
    options: [String],
    correctAnswer: Number,
    explanation: String,
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);
