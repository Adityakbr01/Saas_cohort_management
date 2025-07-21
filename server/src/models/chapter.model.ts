import mongoose, { Schema, Types, Document, Model } from "mongoose";

interface IChapter extends Document {
    _id: Types.ObjectId;
  title: string;
  totalLessons: number;
  totalDuration: number;
  lessons: Types.ObjectId[];
  shortDescription: string;
  cohort: Types.ObjectId;
  isDeleted: boolean;
  isPrivate: boolean;
  Thumbnail: string;
  studentsCompleted: Types.ObjectId[];
  studentsInProgress: Types.ObjectId[];
  assignments: Types.ObjectId[];
  status: "upcoming" | "inProgress" | "completed";
  position: number;
}

interface IChapterModel extends Model<IChapter> {
  getNextPosition(cohortId: Types.ObjectId): Promise<number>;
}

const chapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    cohort: { type: Schema.Types.ObjectId, ref: "Cohort", required: true },
    totalLessons: { type: Number, required: true },
    totalDuration: { type: Number, required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    isDeleted: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    Thumbnail: { type: String, default: "" },
    status: {
      type: String,
      enum: ["upcoming", "inProgress", "completed"],
      default: "upcoming",
    },
    studentsCompleted: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    studentsInProgress: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    assignments: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Unique position within a cohort
chapterSchema.index({ cohort: 1, position: 1 }, { unique: true });

// ✅ Static method to auto-increment position
chapterSchema.statics.getNextPosition = async function (cohortId: Types.ObjectId): Promise<number> {
  const last = await this.findOne({ cohort: cohortId }).sort("-position").select("position").lean();
  return last ? last.position + 1 : 1;
};



export const Chapter = mongoose.model<IChapter, IChapterModel>("Chapter", chapterSchema);
