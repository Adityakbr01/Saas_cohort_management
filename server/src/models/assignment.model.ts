import { model, Schema, Types } from "mongoose";

// ============================
// ✅ Assignment Model
// ============================
export interface IAssignment extends Document {
  title: string;
  instructions: string;
  lesson: Types.ObjectId;
  dueDate: Date;
  maxScore: number;
  codeExamples: Types.ObjectId[];
  rubric: Array<{
    criteria: string;
    points: number;
    description: string;
  }>;
  submissions: Types.ObjectId[];
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 10 },
    codeExamples: [{ type: Schema.Types.ObjectId, ref: "CodeExample" }],
    rubric: [
      {
        criteria: { type: String, required: true },
        points: { type: Number, required: true },
        description: { type: String },
      },
    ],
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
