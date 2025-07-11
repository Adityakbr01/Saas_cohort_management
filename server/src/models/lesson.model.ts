import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface ILesson extends Document {
  _id: Types.ObjectId;
  title: string;
  duration: number;
  contentType: "video" | "text" | "interactive";
  videoUrl?: string;
  body?: string;
  quizzes: Types.ObjectId[];
  assignments: Types.ObjectId[];
  resources: Types.ObjectId[];
  comments: Types.ObjectId[];
  shortDescription: string;
  chapter: Types.ObjectId;
  isDeleted: boolean;
  isPrivate: boolean;
  status: "upcoming" | "inProgress" | "completed";
  studentsCompleted: Types.ObjectId[];
  studentsInProgress: Types.ObjectId[];
  position: number;
}

interface ILessonModel extends Model<ILesson> {
  getNextPosition(chapterId: Types.ObjectId): Promise<number>;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    duration: { type: Number, required: true },
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    isDeleted: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["upcoming", "inProgress", "completed"],
      default: "upcoming",
    },
    contentType: {
      type: String,
      enum: ["video", "text", "interactive"],
      required: true,
    },
    videoUrl: { type: String },
    body: { type: String },
    quizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
    assignments: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    studentsCompleted: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    studentsInProgress: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Unique index
lessonSchema.index({ chapter: 1, position: 1 }, { unique: true });

// ✅ Static method for position
lessonSchema.statics.getNextPosition = async function (
  chapterId: Types.ObjectId
): Promise<number> {
  const lastLesson = await this.findOne({ chapter: chapterId, isDeleted: false })
    .sort("-position")
    .select("position")
    .lean();

  return lastLesson ? lastLesson.position + 1 : 1;
};

// ✅ Utility to update chapter status
async function updateChapterStatus(chapterId: Types.ObjectId) {
  const { Chapter } = await import("./chapter.model");
  const Lesson = mongoose.model<ILesson>("Lesson");

  const lessons = await Lesson.find({ chapter: chapterId, isDeleted: false });

  const total = lessons.length;
  const completed = lessons.filter((l) => l.status === "completed").length;
  const inProgress = lessons.filter((l) => l.status === "inProgress").length;

  let newStatus: "upcoming" | "inProgress" | "completed" = "upcoming";

  if (completed === total && total > 0) {
    newStatus = "completed";
  } else if (completed > 0 || inProgress > 0) {
    newStatus = "inProgress";
  } else {
    newStatus = "upcoming";
  }

  await Chapter.findByIdAndUpdate(chapterId, { status: newStatus });
}

// ✅ Hooks to trigger status update
lessonSchema.post("save", async function (doc) {
  await updateChapterStatus(doc.chapter);
});

lessonSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await updateChapterStatus(doc.chapter);
  }
});

lessonSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateChapterStatus(doc.chapter);
  }
});

export const Lesson = mongoose.model<ILesson, ILessonModel>("Lesson", lessonSchema);
