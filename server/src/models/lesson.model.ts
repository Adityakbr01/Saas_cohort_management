import mongoose, { Document, Schema, Types } from "mongoose";

interface ILesson extends Document {
  title: string;
  duration: number;
  contentType: "video" | "text" | "interactive";
  videoUrl?: string;
  body?: string;
  quizzes: Types.ObjectId[];
  assignments: Types.ObjectId[];
  resources: Types.ObjectId[];
  comments: Types.ObjectId[];
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    contentType: {
      type: String,
      enum: ["video", "text", "interactive"],
      required: true,
    },
    videoUrl: String,
    body: String,
    quizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
    assignments: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);
