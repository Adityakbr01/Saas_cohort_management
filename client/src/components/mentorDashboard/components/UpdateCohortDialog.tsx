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
    duration: cohort.duration || 0,
    price: cohort.price || 0,
    originalPrice: cohort.originalPrice || 0,
    discount: cohort.discount || 0,
    isPrivate: cohort.isPrivate || false,
    limitedTimeOffer: cohort.limitedTimeOffer || {
      isActive: false,
      startDate: "",
      endDate: "",
    },
    thumbnail: null,
    demoVideo: null,
  });

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  // Handle nested limitedTimeOffer fields
  if (name === "limitedTimeOfferStartDate" || name === "limitedTimeOfferEndDate") {
    const key = name === "limitedTimeOfferStartDate" ? "startDate" : "endDate";
    setFormData((prev) => ({
      ...prev,
      limitedTimeOffer: {
        ...prev.limitedTimeOffer,
        [key]: value,
      },
    }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      tags: formData.tags.split(",").map((t: string) => t.trim()),
      prerequisites: formData.prerequisites.split(",").map((p: string) => p.trim()),
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
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} aria-label="Cohort Title" />
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {["Web Development", "Mobile Development", "Data Science", "Machine Learning", "UI/UX Design", "Cybersecurity"].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}>
              <SelectTrigger id="difficulty"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}>
              <SelectTrigger id="language"><SelectValue placeholder="Select language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={formData.location} onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}>
              <SelectTrigger id="location"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Input id="schedule" name="schedule" value={formData.schedule} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input id="maxCapacity" type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger id="status"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" value={formData.tags} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Input id="prerequisites" name="prerequisites" value={formData.prerequisites} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input id="duration" type="number" name="duration" value={formData.duration} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" name="price" value={formData.price} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="originalPrice">Original Price</Label>
            <Input id="originalPrice" type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="discount">Discount (%)</Label>
            <Input id="discount" type="number" name="discount" value={formData.discount} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input id="thumbnail" type="file" name="thumbnail" accept="image/*" onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="demoVideo">Demo Video</Label>
            <Input id="demoVideo" type="file" name="demoVideo" accept="video/*" onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1">Limited Time Offer</Label>
            <div className="flex flex-col md:flex-row gap-2">
              <Switch
                id="limitedTimeOffer"
                checked={formData.limitedTimeOffer.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    limitedTimeOffer: {
                      ...prev.limitedTimeOffer,
                      isActive: checked,
                    },
                  }))
                }
              />
              <Input
                type="datetime-local"
                name="limitedTimeOfferStartDate"
                value={formData.limitedTimeOffer.startDate}
                onChange={handleChange}
                disabled={!formData.limitedTimeOffer.isActive}
              />
              <Input
                type="datetime-local"
                name="limitedTimeOfferEndDate"
                value={formData.limitedTimeOffer.endDate}
                onChange={handleChange}
                disabled={!formData.limitedTimeOffer.isActive}
              />
            </div>
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

          <div className="flex items-center gap-2">
            <Label htmlFor="isPrivate">Is Private</Label>
            <Switch
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPrivate: checked }))
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
