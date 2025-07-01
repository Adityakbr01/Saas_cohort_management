import mongoose, { Schema, Types } from "mongoose";

interface IChapter extends Document {
  title: string;
  totalLessons: number;
  totalDuration: number;
  lessons: Types.ObjectId[];
}

const chapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    totalLessons: { type: Number, required: true },
    totalDuration: { type: Number, required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

export const Chapter = mongoose.model<IChapter>("Chapter", chapterSchema);