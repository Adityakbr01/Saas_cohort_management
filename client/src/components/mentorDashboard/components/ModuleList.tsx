import { useDeleteChapterMutation } from "@/store/features/api/chapters/chapter";
import { toast } from "sonner";
import ChapterCard from "./ChapterCard";
import type { Chapter, Lesson } from "@/types";

type ModuleListProps = {
  chapters: Chapter[];
  setEditingItem: (item: Chapter | Lesson | null) => void;
  refetch: () => void;
};

function ModuleList({
  chapters,
  setEditingItem,
  refetch,
}: ModuleListProps) {
  const [deleteChapterMutation] = useDeleteChapterMutation();

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapterMutation(chapterId).unwrap();
      toast.success("Chapter deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {chapters.map((module, idx) => (
        <ChapterCard
          key={module._id}
          module={module}
          idx={idx}
          setEditingItem={setEditingItem}
          handleDeleteChapter={handleDeleteChapter}
          refetch={refetch}
        />
      ))}
    </div>
  );
}

export default ModuleList;
