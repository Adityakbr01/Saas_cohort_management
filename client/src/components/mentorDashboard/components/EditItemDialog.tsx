import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdtateChapterMutation } from "@/store/features/api/chapters/chapter";
import { useUpdateLessonMutation } from "@/store/features/api/lessons/lesson";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

import type { Chapter, Lesson } from "@/types";
import { EditSchema } from "@/utils/zod";

const EditItemDialog: React.FC<{
  editingItem: Chapter | Lesson | null;
  onClose: () => void;
  refetch: () => void;
}> = ({ editingItem, onClose, refetch }) => {
  const [updateChapter, { isLoading }] = useUpdtateChapterMutation();
  const [updateLesson, { isLoading: isUpdatingLesson }] = useUpdateLessonMutation();

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    contentType: "",
    status: "upcoming",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const isChapter = (item: Chapter | Lesson): item is Chapter =>
    (item as Chapter).lessons !== undefined;

  useEffect(() => {
    if (!editingItem) return;

    setFormData({
      title: editingItem.title || "",
      shortDescription:
        (editingItem as Lesson).shortDescription ||
        (editingItem as Chapter).description ||
        "",
      contentType: isChapter(editingItem) ? "" : editingItem.contentType || "",
      status: editingItem.status || "upcoming",
    });
  }, [editingItem]);

  if (!editingItem) return null;

  const handleSubmit = async () => {
    try {
      const payload = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        status: formData.status,
        ...(isChapter(editingItem) ? {} : { contentType: formData.contentType }),
      };

      const result = EditSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({
          title: fieldErrors.title?.[0],
          shortDescription: fieldErrors.shortDescription?.[0],
          contentType: fieldErrors.contentType?.[0],
        });
        return;
      }

      setErrors({});

      if (isChapter(editingItem)) {
        await updateChapter({
          chapterId: editingItem._id,
          cohortId: editingItem.cohort,
          data: payload,
        }).unwrap();
      } else {
        await updateLesson({
          lessonId: editingItem._id,
          updates: payload,
        }).unwrap();
      }

      await refetch();
      onClose();
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <Dialog open={!!editingItem} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit {isChapter(editingItem) ? "Module" : "Lecture"}
          </DialogTitle>
          <DialogDescription>
            Update the details for this {isChapter(editingItem) ? "module" : "lecture"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
            />
            {errors.shortDescription && (
              <p className="text-red-500 text-xs">{errors.shortDescription}</p>
            )}
          </div>

          {!isChapter(editingItem) && (
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Lecture</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="reading">Reading Material</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
              {errors.contentType && (
                <p className="text-red-500 text-xs">{errors.contentType}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isLoading || isUpdatingLesson} onClick={handleSubmit}>
            {isLoading || isUpdatingLesson ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
