import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, GripVertical, Trash2 } from "lucide-react";
import LectureItem from "./LectureItem";
import AddLectureForm from "./AddLectureForm";
import type { Chapter, Lesson } from "@/types";



type ChapterCardProps = {
  module: Chapter;
  idx: number;
  setEditingItem: (item: Chapter | Lesson | null) => void; // 👈 fix this
  handleDeleteChapter: (id: string) => void;
  refetch: () => void;
};

function ChapterCard({
  module,
  idx,
  setEditingItem,
  handleDeleteChapter,
  refetch,
}:ChapterCardProps) {
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
      className={`transition-all duration-200`}
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
          {module.lessons.map((lecture: Lesson, lectureIndex: number) => (
            <LectureItem
              key={lecture._id}
              lecture={lecture}
              lectureIndex={lectureIndex}
              setEditingItem={setEditingItem}
              refetch={refetch}
            />
          ))}
          <AddLectureForm module={module} refetch={refetch} />
        </div>
      </CardContent>
    </Card>
  );
}

export default ChapterCard;