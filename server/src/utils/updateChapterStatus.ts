import { Chapter } from "@/models/chapter.model";
import { Lesson } from "@/models/lesson.model";
import { Types } from "mongoose";

const updateChapterStatus = async (chapterId: Types.ObjectId) => {
  const allLessons = await Lesson.find({ chapter: chapterId, isDeleted: false });

  const total = allLessons.length;
  const completedCount = allLessons.filter(l => l.status === "completed").length;
  const inProgressCount = allLessons.filter(l => l.status === "inProgress").length;

  let newStatus: "upcoming" | "inProgress" | "completed" = "upcoming";

  if (completedCount === total) {
    newStatus = "completed";
  } else if (completedCount > 0 || inProgressCount > 0) {
    newStatus = "inProgress";
  } else {
    newStatus = "upcoming";
  }

  await Chapter.findByIdAndUpdate(chapterId, { status: newStatus });
};
export default updateChapterStatus;