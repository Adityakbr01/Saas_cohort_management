import { Schema, Types, model } from "mongoose";
// ============================
// ✅ Comment Model
// ============================
export interface IComment extends Document {
  author: Types.ObjectId;
  lesson: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Comment = model<IComment>("Comment", commentSchema);