import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteLessonMutation } from "@/store/features/api/lessons/lesson";
import type { Lecture } from "@/types/course";
import { Clock, Edit, GripVertical, Trash2, Video, Book, Link, FileText, FileQuestion } from "lucide-react";
import { toast } from "sonner";


interface LectureItemProps {
    lecture: Lecture;
    lectureIndex: number;
    draggedItem: any;
    dragOverItem: any;
    handleDragStart: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
    handleDragOver: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
    handleDrop: (e: React.DragEvent, item: any, type: "module" | "lecture") => void;
    setEditingItem: (item: any) => void;
    refetch: () => void;
}

const LectureItem: React.FC<LectureItemProps> = ({
    lecture,
    lectureIndex,
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setEditingItem,
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video":
                return <Video className="h-4 w-4" />;
            case "text":
                return <FileText className="h-4 w-4" />;
            case "interactive":
                return <FileQuestion className="h-4 w-4" />;
            case "reading":
                return <Book className="h-4 w-4" />;
            case "link":
                return <Link className="h-4 w-4" />;
            default:
                return null;
        }
    };


    const [deleteLectureMutation] = useDeleteLessonMutation();
    const handleDeleteLecture = async (lectureId: string) => {
        try {
            await deleteLectureMutation(lectureId).unwrap();
            toast.success("Lecture deleted successfully");
            refetch();
        } catch (error) {
            console.error("Error deleting lecture:", error);
            toast.error("Failed to delete lecture", {
                description: "Please try again later.",
            });
        }
    };



    return (
        <div
            className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-200 ${dragOverItem?.id === lecture._id && dragOverItem?.type === "lecture" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
            draggable
            onDragStart={(e) => handleDragStart(e, lecture, "lecture")}
            onDragOver={(e) => handleDragOver(e, lecture, "lecture")}
            onDrop={(e) => handleDrop(e, lecture, "lecture")}
        >
            <Tooltip>
                <TooltipTrigger>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Drag to reorder lectures</p>
                </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2">
                {getTypeIcon(lecture.contentType)}
                <Badge variant={getStatusColor(lecture.status)} className="text-xs">
                    {lecture.status}
                </Badge>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium text-sm">{lecture.title}</p>
                        <p className="text-xs text-muted-foreground">{lecture.shortDescription}</p>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {lecture.duration ? `${Math.round(lecture.duration / 60)} min` : "N/A"}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{lecture.duration ? `${lecture.duration} seconds (Exact Duration)` : "Duration not available"}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="ghost" size="sm" onClick={() => setEditingItem(lecture)}>
                            <Edit className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit lecture</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLecture(lecture._id)}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent >
                        <p>Delete lecture</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};

export default LectureItem;