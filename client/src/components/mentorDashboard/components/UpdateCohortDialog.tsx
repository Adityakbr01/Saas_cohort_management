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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

export function UpdateCohortDialog({
  cohort,
  onUpdate,
}: {
  cohort: any;
  onUpdate: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: cohort.title || "",
    shortDescription: cohort.shortDescription || "",
    description: cohort.description || "",
    startDate: cohort.startDate?.slice(0, 10) || "",
    endDate: cohort.endDate?.slice(0, 10) || "",
    maxCapacity: cohort.maxCapacity || 0,
    category: cohort.category || "",
    difficulty: cohort.difficulty || "",
    schedule: cohort.schedule || "",
    location: cohort.location || "",
    language: cohort.language || "",
    certificateAvailable: cohort.certificateAvailable || false,
    tags: cohort.tags?.join(", ") || "",
    prerequisites: cohort.prerequisites?.join(", ") || "",
    status: cohort.status || "upcoming",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      tags: formData.tags.split(",").map((t:string) => t.trim()),
      prerequisites: formData.prerequisites.split(",").map((p:string) => p.trim()),
    };
    onUpdate(updatedData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Cohort</DialogTitle>
          <DialogDescription>Edit cohort details below.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div>
            <Label>Short Description</Label>
            <Input name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div>
            <Label>Start Date</Label>
            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          </div>

          <div>
            <Label>End Date</Label>
            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          </div>

          {/* Category Dropdown */}
          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
                  "UI/UX Design", "Cybersecurity", "Cloud Computing", "DevOps",
                  "Blockchain", "Mathematics", "Physics", "Chemistry", "Biology",
                  "English", "Commerce", "Product Management", "Startup Mentorship",
                  "Career Counseling", "Soft Skills", "Public Speaking", "Mental Health", "Other"
                ].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <Label>Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Dropdown */}
          <div>
            <Label>Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Dropdown */}
          <div>
            <Label>Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, location: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Schedule</Label>
            <Input name="schedule" value={formData.schedule} onChange={handleChange} />
          </div>

          <div>
            <Label>Max Capacity</Label>
            <Input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags</Label>
            <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="mern, javascript, ..." />
          </div>

          <div>
            <Label>Prerequisites</Label>
            <Input name="prerequisites" value={formData.prerequisites} onChange={handleChange} placeholder="HTML, CSS, ..." />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="certificateAvailable">Certificate Available</Label>
            <Switch
              id="certificateAvailable"
              checked={formData.certificateAvailable}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, certificateAvailable: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
