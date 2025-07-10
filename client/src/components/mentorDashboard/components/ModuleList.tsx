import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Edit, GripVertical, Plus, Trash2 } from "lucide-react";
import { useDeleteChapterMutation } from "@/store/features/api/chapters/chapter";
import { toast } from "sonner";

import AddLectureForm from "./AddLectureForm";
import LectureItem from "./LectureItem";
import type { Chapter, Lecture } from "@/types/course";

interface ModuleListProps {
  chapters: Chapter[];
  draggedItem: any;
  dragOverItem: any;
  handleDragStart: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  handleDragOver: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  handleDrop: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  setEditingItem: (item: any) => void;
  refetch: () => void;
}

const ModuleList: React.FC<ModuleListProps> = ({
  chapters,
  draggedItem,
  dragOverItem,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setEditingItem,
  refetch,
}) => {
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
          draggedItem={draggedItem}
          dragOverItem={dragOverItem}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          setEditingItem={setEditingItem}
          handleDeleteChapter={handleDeleteChapter}
          refetch={refetch}
        />
      ))}
    </div>
  );
};

interface ChapterCardProps {
  module: Chapter;
  idx: number;
  draggedItem: any;
  dragOverItem: any;
  handleDragStart: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  handleDragOver: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  handleDrop: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
  setEditingItem: (item: any) => void;
  handleDeleteChapter: (chapterId: string) => void;
  refetch: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  module,
  idx,
  draggedItem,
  dragOverItem,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setEditingItem,
  handleDeleteChapter,
  refetch,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "inProgress":
        return "secondary";
      case "upcoming":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${dragOverItem?.id === module._id && dragOverItem?.type === "module" ? "border-primary bg-primary/5" : ""}`}
      draggable
      onDragStart={(e) => handleDragStart(e, module, "module")}
      onDragOver={(e) => handleDragOver(e, module, "module")}
      onDrop={(e) => handleDrop(e, module, "module")}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger>
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag to reorder modules</p>
              </TooltipContent>
            </Tooltip>
            <div>
              <CardTitle className="flex items-center gap-2">
                Module {idx + 1}: {module.title}
                <Badge variant={getStatusColor(module.status)}>{module.status}</Badge>
              </CardTitle>
              <CardDescription>{module.shortDescription}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{module.totalDuration} min</Badge>
            <Button variant="ghost" size="sm" onClick={() => setEditingItem(module)}>
              <Edit className="h-9 w-9" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteChapter(module._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <div className="space-y-3">
          {module.lessons.map((lecture: Lecture, lectureIndex: number) => (
            <LectureItem
              key={lecture._id}
              lecture={lecture}
              lectureIndex={lectureIndex}
              draggedItem={draggedItem}
              dragOverItem={dragOverItem}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setEditingItem={setEditingItem}
              refetch={refetch}
            />
          ))}
          <AddLectureForm module={module} refetch={refetch} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleList;