import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddVideoLessonMutation } from "@/store/features/api/lessons/lesson";
import type { Chapter } from "@/types";
import { LectureSchema } from "@/utils/zod";
import { Loader, Plus } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { FancyFileUploader } from "./FancyFileUploader";

interface AddLectureFormProps {
  module: Chapter;
  refetch: () => void;
}

const AddLectureForm: React.FC<AddLectureFormProps> = ({ module, refetch }) => {
  const [addVideoLessonMutation, { isLoading }] = useAddVideoLessonMutation();
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    contentType: "video",
    status: "upcoming",
    position: "end",
    video: null as File | null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  useEffect(() => {
    if (formData.video) {
      const url = URL.createObjectURL(formData.video);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreview(null);
    }
  }, [formData.video]);

  const handleAddLecture = async (e: FormEvent) => {
    e.preventDefault();

    const validation = LectureSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        shortDescription: fieldErrors.shortDescription?.[0],
      });
      return;
    }

    if (formData.contentType === "video") {
      if (!formData.video) {
        toast.error("Video file is required");
        return;
      }

      const allowedTypes = ["video/mp4", "video/mpeg", "video/quicktime"];
      if (!allowedTypes.includes(formData.video.type)) {
        toast.error("Invalid video format", {
          description: "Allowed formats: MP4, MPEG, MOV.",
        });
        return;
      }
    }

    try {
      await addVideoLessonMutation({
        chapterId: module._id,
        lesson: {
          title: formData.title,
          shortDescription: formData.shortDescription,
          contentType: formData.contentType,
          status: formData.status,
          isPrivate: false,
          video: formData.video!,
        },
      }).unwrap();

      refetch();
      toast.success("Lecture added successfully");

      setIsAddingLecture(false);
      setFormData({
        title: "",
        shortDescription: "",
        contentType: "video",
        status: "upcoming",
        position: "end",
        video: null,
      });
      setErrors({});
      setVideoPreview(null);
    } catch (error) {
      console.error("Error adding lecture:", error);
      toast.error("Failed to add lecture");
    }
  };

  return (
    <Dialog
      open={isAddingLecture}
      onOpenChange={(open) => {
        setIsAddingLecture(open);
        if (!open) {
          setFormData({
            title: "",
            shortDescription: "",
            contentType: "video",
            status: "upcoming",
            position: "end",
            video: null,
          });
          setErrors({});
          setVideoPreview(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
          <DialogDescription>Add a new lecture to {module.title}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddLecture}>
          <div className="grid grid-cols-2 gap-4 py-4 overflow-auto">
            {/* Title */}
            <div className="col-span-2 space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Enter lecture title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter description"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
              {errors.shortDescription && (
                <p className="text-xs text-red-500">{errors.shortDescription}</p>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentType: value,
                    video: null,
                  }))
                }
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

            {/* Video File */}
            {formData.contentType === "video" && (
              <>
                <div className="col-span-2 space-y-2">
                  <Label>Video File</Label>
                  <FancyFileUploader
                    label="Upload Video"
                    accept="video/mp4,video/mpeg,video/quicktime"
                    onFileSelect={(file) =>
                      setFormData((prev) => ({
                        ...prev,
                        video: file,
                      }))
                    }
                  />

                </div>

                {/* Video Preview */}
                {videoPreview && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground mb-1 block">
                      Preview
                    </Label>
                    <video
                      controls
                      src={videoPreview}
                      className="w-full rounded-lg border shadow"
                    />
                  </div>
                )}
              </>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Lecture"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLectureForm;
