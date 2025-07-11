import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import  { ChapterSchema } from "@/utils/zod";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";

// Add Module Dialog Component
const AddModuleDialog: React.FC<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cohortId: string;
    onAddModule: (formData: z.infer<typeof ChapterSchema>) => Promise<void>;
}> = ({ isOpen, onOpenChange, cohortId, onAddModule }) => {
    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        totalLessons: 0,
        totalDuration: 0,
        cohortId,
    });
    const [errors, setErrors] = useState<Partial<z.infer<typeof ChapterSchema>>>({});

    const handleSubmit = async () => {
        try {
            const validatedData = ChapterSchema.parse(formData);
            await onAddModule(validatedData);
            setFormData({ title: "", shortDescription: "", totalLessons: 0, totalDuration: 0, cohortId });
            setErrors({});
            onOpenChange(false);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = error.flatten().fieldErrors;
                setErrors(fieldErrors);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Add New Module</DialogTitle>
                    <DialogDescription>Create a new learning module for your curriculum.</DialogDescription>
                </AlertDialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="Enter module title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Enter module description"
                            rows={3}
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        />
                        {errors.shortDescription && <p className="text-red-500 text-xs">{errors.shortDescription}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Total Lessons</Label>
                        <Input
                            type="number"
                            placeholder="e.g., 4"
                            value={formData.totalLessons}
                            onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                        />
                        {errors.totalLessons && <p className="text-red-500 text-xs">{errors.totalLessons}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Total Duration (minutes)</Label>
                        <Input
                            type="number"
                            placeholder="e.g., 60"
                            value={formData.totalDuration}
                            onChange={(e) => setFormData({ ...formData, totalDuration: parseInt(e.target.value) || 0 })}
                        />
                        {errors.totalDuration && <p className="text-red-500 text-xs">{errors.totalDuration}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Add Module</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddModuleDialog;