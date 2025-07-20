import { useDeleteChapterMutation } from "@/store/features/api/chapters/chapter";
import { toast } from "sonner";
import ChapterCard from "./ChapterCard";
import type { Chapter, Lesson } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from "react";
import { Button } from '@/components/ui/button';

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
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

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
    <>
      <div className="space-y-6">
        {chapters.map((module, idx) => (
          <ChapterCard
            key={module._id}
            module={module}
            idx={idx}
            setEditingItem={setEditingItem}
            handleDeleteChapter={() => setChapterToDelete(module._id)}
            refetch={refetch}
          />
        ))}
      </div>
      {chapters.length === 0 && (
        <div className="text-center text-muted-foreground">
          No modules found. Create a new module to get started.
        </div>
      )}
      {/* Chapter Delete Confirmation Dialog */}
      <Dialog open={!!chapterToDelete} onOpenChange={open => !open && setChapterToDelete(null)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this chapter?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (chapterToDelete) { handleDeleteChapter(chapterToDelete); setChapterToDelete(null); } }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModuleList;
