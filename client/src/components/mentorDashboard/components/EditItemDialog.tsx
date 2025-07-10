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
import { useEffect, useState } from "react";
import * as z from "zod";
import { ChapterSchema } from "./curriculum-builder";
import { Loader } from "lucide-react";
import { useUpdateLessonMutation } from "@/store/features/api/lessons/lesson";

const EditItemDialog: React.FC<{
  editingItem: any;
  onClose: () => void;
  refetch: () => void;
}> = ({ editingItem, onClose, refetch }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    status: "",
  });

  //rtk 
  const [updateChapter, { isLoading }] = useUpdtateChapterMutation();
  const [updateLesson, { isLoading: isUpdatingLesson }] = useUpdateLessonMutation();

  const [errors, setErrors] = useState<Partial<z.infer<typeof ChapterSchema>>>({});

  // ✅ Sync formData when editingItem changes
  useEffect(() => {
    if (!editingItem) return;

    setFormData({
      title: editingItem.title || "",
      description: editingItem.shortDescription || editingItem.description || "",
      type: editingItem.contentType || "",
      status: editingItem.status || "upcoming",
    });
  }, [editingItem]);

  if (!editingItem) return null; // Prevent render if null

  const handleSubmit = async () => {

    try {
      const payload = {
        title: formData.title.trim(),
        shortDescription: formData.description.trim(),
        status: formData.status,
        ...(editingItem?.lessons
          ? {} // Module
          : {
            contentType: formData.type,
          }),
      };

      const schema = editingItem?.lessons
        ? ChapterSchema.omit({ cohortId: true })
        : ChapterSchema.omit({ cohortId: true });

      schema.parse(payload);
      setErrors({});

      if (editingItem?.lessons) {
        await updateChapter({
          chapterId: editingItem._id,
          cohortId: editingItem.cohort,
          data: payload,
        }).unwrap();

        // ✅ Wait until update is fully done
        await refetch(); // 🔁 Now fresh data will come

      } else {
        // add lesson update logic here if needed
        await updateLesson({
          lessonId: editingItem._id,
          updates: payload,
        }).unwrap();
        // ✅ Wait until update is fully done
        await refetch();
      }

      onClose(); // ✅ close only after everything is done
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.flatten().fieldErrors);
        setErrors(error.flatten().fieldErrors);
      }
    }
  };


  return (
    <Dialog open={!!editingItem} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit {editingItem?.lessons ? "Module" : "Lecture"}
          </DialogTitle>
          <DialogDescription>
            Update the details for this {editingItem?.lessons ? "module" : "lecture"}.
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
              value={formData.description}
              rows={3}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.shortDescription && (
              <p className="text-red-500 text-xs">{errors.shortDescription}</p>
            )}
          </div>

          {!editingItem?.lessons && (
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={editingItem}
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
          <Button disabled={isLoading || isUpdatingLesson} onClick={handleSubmit}><>
            {isLoading || isUpdatingLesson ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save"}</></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
