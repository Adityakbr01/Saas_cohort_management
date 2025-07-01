import mongoose, { Schema } from "mongoose";

interface IAssignment extends Document {
  title: string;
  instructions: string;
  points: number;
  dueDate: Date;
  resourceUrl?: string;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    points: { type: Number, default: 10 },
    dueDate: { type: Date, required: true },
    resourceUrl: String,
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
