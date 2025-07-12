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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCohortMutation, useGetmentorCohortQuery } from "@/store/features/api/cohorts/cohorts.api";
import { useGetmyorgQuery } from "@/store/features/api/mentor/mentorApi";
import type { APIErrorResponse, Cohort } from "@/types";
import {
  Plus,
  Search
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Analytics from "./Analytics";
import CohortManagement from "./cohort-management";
import CommunicationCenter from "./communication-center";
import CreateCohortDialog from "./CreateCohortDialog";
import CurriculumBuilder from "./curriculum-builder";
import MentorStudentProfile from "./mentor-student-profile";
import MentorHeader from "./MentorHeader";
import PerformanceOverview from "./PerformanceOverview";
import QuickStats from "./QuickStats";
import RecentActivity from "./RecentActivity";
import StudentManagement from "./student-management";
import { StudentsTable } from "./StudentsTable";
import Tools from "./Tools";
import UpcomingEvents from "./UpcomingEvents";

// Mock data (unchanged from previous)
const mentorData = {
  id: "mentor_1",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@edulaunch.com",
  avatar: "/placeholder.svg?height=80&width=80",
  specialization: "Data Science",
  totalStudents: 45,
  activeCohorts: 3,
  completedCohorts: 8,
  averageRating: 4.9,
  responseTime: "< 2 hours",
};
const dashboardStats = {
  totalStudents: 45,
  activeStudents: 42,
  atRiskStudents: 3,
  activeCohorts: 3,
  averageProgress: 78,
  completionRate: 92,
  monthlyGrowth: 12.5,
};

const recentActivity = [
  {
    id: "1",
    type: "assignment_submitted",
    student: "John Doe",
    cohort: "Data Science Bootcamp",
    time: "2 hours ago",
    description: "Submitted Python Fundamentals Assignment",
  },
  {
    id: "2",
    type: "question_asked",
    student: "Jane Smith",
    cohort: "ML Advanced",
    time: "4 hours ago",
    description: "Asked question about neural networks",
  },
  {
    id: "3",
    type: "milestone_reached",
    student: "Bob Wilson",
    cohort: "Data Science Bootcamp",
    time: "1 day ago",
    description: "Completed Module 3: Statistics",
  },
];

export const upcomingEvents = [
  {
    id: "1",
    title: "Data Science Bootcamp - Week 6 Session",
    date: "2024-06-25",
    time: "18:00",
    type: "live_session",
    cohort: "Data Science Bootcamp",
    attendees: 25,
  },
  {
    id: "2",
    title: "ML Advanced - Project Review",
    date: "2024-06-26",
    time: "19:00",
    type: "review_session",
    cohort: "ML Advanced",
    attendees: 15,
  },
  {
    id: "3",
    title: "Office Hours",
    date: "2024-06-27",
    time: "16:00",
    type: "office_hours",
    cohort: "All Cohorts",
    attendees: 0,
  },
];

const performanceData = [
  { month: "Jan", engagement: 85, completion: 88, satisfaction: 4.7 },
  { month: "Feb", engagement: 88, completion: 90, satisfaction: 4.8 },
  { month: "Mar", engagement: 92, completion: 92, satisfaction: 4.9 },
  { month: "Apr", engagement: 89, completion: 89, satisfaction: 4.8 },
  { month: "May", engagement: 94, completion: 94, satisfaction: 4.9 },
  { month: "Jun", engagement: 91, completion: 92, satisfaction: 4.9 },
];

// Main MentorDashboard Component
export default function MentorDashboard() {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: orgData } = useGetmyorgQuery();
  const [createCohort, { isLoading: isCreatingCohort }] = useCreateCohortMutation();
  const { data } = useGetmentorCohortQuery(undefined);
  const myCohorts = data?.data?.cohorts || [];

  const handleViewCohort = (cohortId: string) => {
    setSelectedCohort(cohortId);
    setCurrentView("cohort");
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setCurrentView("student");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedCohort(null);
    setSelectedStudent(null);
  };

  const handleCreateCohort = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const cohortData = {
      title: formData.get("title")?.toString() || "",
      shortDescription: formData.get("shortDescription")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      mentor: formData.get("mentor")?.toString() || "",
      organization: formData.get("organization")?.toString() || "",
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate") as string).toISOString()
        : "",
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string).toISOString()
        : "",
      maxCapacity: formData.get("maxCapacity")
        ? Number(formData.get("maxCapacity"))
        : 0,
      status: formData.get("status")?.toString() || "",
      category: formData.get("category")?.toString() || "",
      difficulty: formData.get("difficulty")?.toString() || "",
      schedule: formData.get("schedule")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      language: formData.get("language")?.toString() || "",
      tags: formData.get("tags")
        ? formData.get("tags")!.toString().split(",").map((tag) => tag.trim())
        : [],
      prerequisites: formData.get("prerequisites")
        ? formData.get("prerequisites")!.toString().split(",").map((p) => p.trim())
        : [],
      certificateAvailable: formData.get("certificateAvailable") === "true",
      chapters: [],
      duration: formData.get("duration")
        ? Number(formData.get("duration"))
        : 0,
      price: formData.get("price")
        ? Number(formData.get("price"))
        : 0,
      originalPrice: formData.get("originalPrice")
        ? Number(formData.get("originalPrice"))
        : 0,
      discount: formData.get("discount")
        ? Number(formData.get("discount"))
        : 0,
    };

    const requiredFields: (keyof typeof cohortData)[] = [
      "title",
      "shortDescription",
      "description",
      "mentor",
      "organization",
      "startDate",
      "endDate",
      "maxCapacity",
      "status",
      "category",
      "difficulty",
      "language",
      "schedule",
    ];

    const missingFields = requiredFields.filter(
      (field) => cohortData[field] === undefined || cohortData[field] === ""
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields", {
        description: missingFields.join(", "),
      });
      return;
    }

    if (
      isNaN(Date.parse(cohortData.startDate)) ||
      isNaN(Date.parse(cohortData.endDate))
    ) {
      toast.error("Invalid date format", {
        description: "Please ensure start and end dates are valid.",
      });
      return;
    }

    if (new Date(cohortData.startDate) >= new Date(cohortData.endDate)) {
      toast.error("Invalid date range", {
        description: "End date must be after start date.",
      });
      return;
    }

    if (cohortData.maxCapacity <= 0) {
      toast.error("Invalid capacity", {
        description: "Maximum capacity must be a positive number.",
      });
      return;
    }

    const apiFormData = new FormData();
    Object.entries(cohortData).forEach(([key, value]) => {
      if (["tags", "prerequisites", "chapters"].includes(key)) {
        apiFormData.append(key, JSON.stringify(value));
      } else {
        apiFormData.append(key, value.toString());
      }
    });

    if (thumbnailFile) {
      apiFormData.append("Thumbnail", thumbnailFile);
    }
    if (demoVideoFile) {
      apiFormData.append("demoVideo", demoVideoFile);
    }

    const toastId = toast.loading("Creating cohort...");

    try {
      await createCohort(apiFormData).unwrap();
      toast.success("Cohort created successfully!", {
        id: toastId,
      });
      window.location.reload();
      setThumbnailFile(null);
      setDemoVideoFile(null);
      setIsDialogOpen(false);
    } catch (err) {
      const error = err as APIErrorResponse;
      console.error("API Error:", error);
      toast.error("Failed to create cohort", {
        id: toastId,
        description: error.data?.message || "Please try again.",
      });
    }
  };


  if (currentView === "cohort" && selectedCohort) {
    return (
      <CohortManagement
        cohortId={selectedCohort}
        onBack={handleBackToDashboard}
        onViewStudent={handleViewStudent}
        onEditCurriculum={() => setCurrentView("curriculum")}
      />
    );
  }

  if (currentView === "student" && selectedStudent) {
    return (
      <MentorStudentProfile
        studentId={selectedStudent}
        onBack={() => {
          if (selectedCohort) {
            setCurrentView("cohort");
          } else {
            handleBackToDashboard();
          }
        }}
      />
    );
  }

  if (currentView === "curriculum") {
    console.log("v1")
    return <CurriculumBuilder cohortId={selectedCohort || ""} onBack={() => setCurrentView("cohort")} />;
  }

  if (currentView === "communication") {
      console.log("v2")
    return <CommunicationCenter onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <MentorHeader mentorData={mentorData} onMessagesClick={() => setCurrentView("communication")} />
        <QuickStats stats={dashboardStats} />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cohorts">My Cohorts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity activities={recentActivity} />
              <UpcomingEvents events={upcomingEvents} />
            </div>
            <PerformanceOverview performanceData={performanceData} />
          </TabsContent>
          <TabsContent value="cohorts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Cohorts</h3>
              <CreateCohortDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                orgData={orgData || []}
                onCreateCohort={handleCreateCohort}
                isCreatingCohort={isCreatingCohort}
                thumbnailFile={thumbnailFile}
                setThumbnailFile={setThumbnailFile}
                demoVideoFile={demoVideoFile}
                setDemoVideoFile={setDemoVideoFile}
              />
            </div>
            <StudentManagement
              cohorts={myCohorts}
              onViewCohort={handleViewCohort}
              onViewStudent={handleViewStudent}
            />
          </TabsContent>
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">All Students</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search students..." className="pl-10 w-80" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Create a new student profile and assign to a cohort.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input placeholder="Enter student name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="student@email.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assign to Cohort</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cohort" />
                          </SelectTrigger>
                          <SelectContent>
                            {myCohorts.map((cohort: Cohort) => (
                              <SelectItem key={cohort._id} value={cohort._id}>
                                {cohort.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Learning Track</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select track" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Student</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <StudentsTable onViewStudent={handleViewStudent} />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
            <Analytics performanceData={performanceData} />
          </TabsContent>
          <TabsContent value="tools" className="space-y-6">
            <Tools
              onCurriculumClick={() => setCurrentView("curriculum")}
              onCommunicationClick={() => setCurrentView("communication")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}