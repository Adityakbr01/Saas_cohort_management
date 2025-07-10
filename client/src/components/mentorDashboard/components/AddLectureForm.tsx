import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddVideoLessonMutation } from "@/store/features/api/lessons/lesson";
import type { Chapter } from "@/types/course";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";


interface AddLectureFormProps {
  module: Chapter;
  refetch: () => void;
}

const AddLectureForm: React.FC<AddLectureFormProps> = ({ module, refetch }) => {
  const [addVideoLessonMutation] = useAddVideoLessonMutation();
  
  const [isAddingLecture, setIsAddingLecture] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: "",
    contentType: "video",
    description: "",
    status: "upcoming",
    position: "end",
    video: null as File | null,
  });

  const handleAddLecture = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Lecture title is required", {
        description: "Please provide a valid title.",
      });
      return;
    }
    if (formData.contentType === "video" && !formData.video) {
      toast.error("Video file is required", {
        description: "Please upload a video.",
      });
      return;
    }
    if (formData.contentType === "video" && !["video/mp4", "video/mpeg", "video/quicktime"].includes(formData.video?.type || "")) {
      toast.error("Invalid video format", {
        description: "Allowed formats: MP4, MPEG, MOV.",
      });
      return;
    }

    try {
      const positionIndex = formData.position === "end"
        ? module.lessons.length
        : formData.position === "beginning"
        ? 0
        : parseInt(formData.position.split("-")[1]) + 1;

      
        await addVideoLessonMutation({
          chapterId: module._id,
          lesson: {
            title: formData.title,
            shortDescription: formData.description,
            contentType: formData.contentType,
            status: formData.status,
            isPrivate: false,
            video: formData.video!,
          },
        }).unwrap()
        refetch();
        toast.success("Video lecture is being processed", {
          description: "The video will be available soon.",
        });

        setIsAddingLecture(false);
        setFormData({ title: "", contentType: "video",description: "", status: "upcoming", position: "end", video: null }); 
    } catch (error) {
        
      console.error("Error adding lecture:", error);
      toast.error(error?.data?.error || "Failed to add lecture", {
        description: "Please try again later.",
      });
    }
  };



  return (
    <Dialog
      open={isAddingLecture}
      onOpenChange={(open) => {
        setIsAddingLecture(open);
        if (!open) setFormData({ title: "", contentType: "video", description: "", status: "upcoming", position: "end", video: null });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
          <DialogDescription>Add a new lecture to {module.title}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddLecture}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Lecture Title</Label>
              <Input
                placeholder="Enter lecture title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) => {
    setFormData((prev) => ({
      ...prev,
      contentType: value,
      duration: value === "video" ? "" : "0", 
      video: null,
    }));
  }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Lecture</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.contentType === "video" && (
              <div className="col-span-2 space-y-2">
                <Label>Video File</Label>
                <Input
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime"
                  onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                  required
                />
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter lecture description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginning">At the beginning</SelectItem>
                  <SelectItem value="end">At the end</SelectItem>
                  {module.lessons.map((lecture, index) => (
                    <SelectItem key={lecture._id} value={`after-${index}`}>
                      After "{lecture.title}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingLecture(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lecture</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLectureForm;