import mongoose, { Schema, Types } from "mongoose";

interface IComment extends Document {
  user: Types.ObjectId;
  text: string;
  createdAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
