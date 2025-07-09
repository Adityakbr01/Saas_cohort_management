import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import * as z from "zod";
import { ChapterSchema } from "./curriculum-builder";


// Edit Item Dialog Component
const EditItemDialog: React.FC<{
    editingItem: any;
    onClose: () => void;
}> = ({ editingItem, onClose }) => {
    const [formData, setFormData] = useState(editingItem || {});
    const [errors, setErrors] = useState<Partial<z.infer<typeof ChapterSchema>>>({});

    const handleSubmit = () => {
        try {
            const schema = editingItem?.lectures
                ? ChapterSchema.omit({ cohortId: true, totalLessons: true, totalDuration: true })
                : ChapterSchema.omit({ cohortId: true });
            schema.parse(formData);
            setErrors({});
            onClose();
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(error.flatten().fieldErrors);
            }
        }
    };

    return (
        <Dialog open={!!editingItem} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit {editingItem?.lectures ? "Module" : "Lecture"}</DialogTitle>
                    <DialogDescription>
                        Update the details for this {editingItem?.lectures ? "module" : "lecture"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                        {errors.shortDescription && <p className="text-red-500 text-xs">{errors.shortDescription}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                            value={formData.duration || ""}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>
                    {!editingItem?.lectures && (
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
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
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default EditItemDialog;