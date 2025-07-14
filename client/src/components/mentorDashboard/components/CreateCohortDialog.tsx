import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { selectCurrentUser } from "@/store/features/slice/UserAuthSlice";
import type { Organization } from "@/types";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

// CreateCohortDialog Component
interface CreateCohortDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orgData: Organization[];
  onCreateCohort: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isCreatingCohort: boolean;
  thumbnailFile: File | null;
  setThumbnailFile: (file: File | null) => void;
  demoVideoFile: File | null;
  setDemoVideoFile: (file: File | null) => void;
}



function CreateCohortDialog({
  isOpen,
  onOpenChange,
  orgData,
  onCreateCohort,
  isCreatingCohort,
  setThumbnailFile,
  setDemoVideoFile,
}: CreateCohortDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState("upcoming");

  const user = useSelector(selectCurrentUser);


  const handleDialogClose = (form: HTMLFormElement | null) => {
    onOpenChange(false);
    if (form) {
      window.location.reload();
      setThumbnailFile(null);
      setDemoVideoFile(null);
      const selects = form.querySelectorAll("select");
      selects.forEach(select => {
        if (select.name === "organization") select.value = orgData?.[0]?._id || "";
        else if (select.name === "status") select.value = "upcoming";
        else if (select.name === "location") select.value = "Online";
        else if (select.name === "language") select.value = "English";
        else if (select.name === "certificateAvailable") select.value = "true";
        else select.value = "";
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Cohort
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Cohort</DialogTitle>
          <DialogDescription>
            Set up a new learning cohort for your students. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-none scrollbar-hide">
          <form onSubmit={onCreateCohort}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cohort Title</label>
                <Input name="title" placeholder="Enter cohort title" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Input name="shortDescription" placeholder="Enter short description" required />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="Enter detailed description" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mentor ID</label>
                <Input
                  name="mentor"
                  placeholder="Enter mentor ID"
                  defaultValue={user?.role === "mentor" ? user._id : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>
                <Select name="organization" defaultValue={orgData?.[0]?._id || ""} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgData?.map(org => (
                      <SelectItem key={org._id} value={org._id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input name="startDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input name="endDate" type="date" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Capacity</label>
                <Input name="maxCapacity" type="number" placeholder="10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select name="status" defaultValue="upcoming" required  onValueChange={(value) => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedStatus === "upcoming" && (
  <div className="space-y-2 col-span-2">
    <label className="text-sm font-medium">Activate On</label>
    <Input
      name="activateOn"
      type="datetime-local"
      defaultValue={new Date().toISOString().slice(0, 16)}
      required
    />
  </div>
)}


              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                    <SelectItem value="Product Management">Product Management</SelectItem>
                    <SelectItem value="Startup Mentorship">Startup Mentorship</SelectItem>
                    <SelectItem value="Career Counseling">Career Counseling</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Public Speaking">Public Speaking</SelectItem>
                    <SelectItem value="Mental Health">Mental Health</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select name="difficulty" required>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail Image</label>
                <Input
                  type="file"
                  name="Thumbnail"
                  accept="image/*"
                  onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Demo Video</label>
                <Input
                  type="file"
                  name="demoVideo"
                  accept="video/*"
                  onChange={e => setDemoVideoFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule</label>
                <Input
                  name="schedule"
                  placeholder="e.g., Monday, Wednesday, Friday — 7:00 PM to 9:00 PM"
                  defaultValue="Monday, Wednesday, Friday — 7:00 PM to 9:00 PM"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select name="location" defaultValue="Online" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select name="language" defaultValue="English" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input name="tags" placeholder="e.g., mern, javascript, nodejs" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prerequisites (comma-separated)</label>
                <Input name="prerequisites" placeholder="e.g., Basic programming, HTML, CSS" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Certificate Available</label>
                <Select name="certificateAvailable" defaultValue="true" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input name="duration" type="number" placeholder="e.g., 12 weeks" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input name="price" type="number" placeholder="e.g., 100" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Original Price</label>
                <Input name="originalPrice" type="number" placeholder="e.g., 150" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount</label>
                <Input name="discount" type="number" placeholder="e.g., 20" required  max={100}/>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(document.querySelector("form") as HTMLFormElement)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCohort}>
                {isCreatingCohort ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Cohort"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCohortDialog;
