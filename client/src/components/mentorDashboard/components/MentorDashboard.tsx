import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCohortMutation } from "@/store/features/api/cohorts/cohorts.api";
import { useGetmyorgQuery } from "@/store/features/api/mentor/mentorApi";
import type { APIErrorResponse } from "@/types";
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  GraduationCap,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import CohortManagement from "./cohort-management";
import CommunicationCenter from "./communication-center";
import CurriculumBuilder from "./curriculum-builder";
import MentorStudentProfile from "./mentor-student-profile";
import StudentManagement from "./student-management";

// Mock data (unchanged)
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

const upcomingEvents = [
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

export default function MentorDashboard() {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // New state for Dialog
  const { data: orgData } = useGetmyorgQuery();
  const [createCohort, { isLoading: isCreatingCohort }] = useCreateCohortMutation();

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

  // Reset form and state
const resetForm = (form: EventTarget | null) => {
  const htmlForm = form as HTMLFormElement | null;
  if (!htmlForm) return;

  htmlForm.reset(); // Reset HTML form inputs
  setThumbnailFile(null);
  setDemoVideoFile(null);

  const selects = htmlForm.querySelectorAll("select");
  selects.forEach(select => {
    if (select.name === "organization") select.value = orgData?.[0]?._id || "";
    else if (select.name === "status") select.value = "upcoming";
    else if (select.name === "location") select.value = "Online";
    else if (select.name === "language") select.value = "English";
    else if (select.name === "certificateAvailable") select.value = "true";
    else select.value = "";
  });
};


  // Handle cohort creation
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

    for (const [key, value] of apiFormData.entries()) {
      console.log(`[DEBUG] FormData: ${key} = ${value}`);
    }

    // 🟡 Show loader
    const toastId = toast.loading("Creating cohort...");

    try {
        await createCohort(apiFormData).unwrap();
      toast.success("Cohort created successfully!", {
        id: toastId,
      });

     resetForm(event.currentTarget);
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


  // Handle dialog close
  const handleDialogClose = (form: HTMLFormElement | null) => {
    setIsDialogOpen(false);
    if (form) {
      resetForm(form); // Reset form on cancel
    }
  };

  // Rest of the component remains unchanged
  // Render different views based on current state
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
    return <CurriculumBuilder cohortId={selectedCohort || ""} onBack={() => setCurrentView("cohort")} />;
  }

  if (currentView === "communication") {
    return <CommunicationCenter onBack={handleBackToDashboard} />;
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentorData.avatar || "/placeholder.svg"} alt={mentorData.name} />
              <AvatarFallback className="text-lg">
                {mentorData.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {mentorData.name.split(" ")[1]}!</h1>
              <p className="text-muted-foreground">{mentorData.specialization} Mentor</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentView("communication")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.activeStudents} active, {dashboardStats.atRiskStudents} at risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeCohorts}</div>
              <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth}% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageProgress}%</div>
              <Progress value={dashboardStats.averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cohorts">My Cohorts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Cohorts</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
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
                    <form onSubmit={handleCreateCohort}>
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
                            defaultValue="686225d0975afe617d28b617"
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
                          <Input name="startDate" type="date" required />
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
                          <Select name="status" defaultValue="upcoming" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          {isCreatingCohort ? <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </> : "Create Cohort"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <StudentManagement onViewCohort={handleViewCohort} onViewStudent={handleViewStudent} />
          </TabsContent>

          {/* Rest of the TabsContent (overview, students, analytics, tools) remains unchanged */}
          {/* Overview Tab */}
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your students and cohorts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === "assignment_submitted" && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          {activity.type === "question_asked" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          {activity.type === "milestone_reached" && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{activity.student}</p>
                              <p className="text-sm text-muted-foreground">{activity.cohort}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                          <p className="text-sm mt-1">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Your scheduled sessions and meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0">
                          {event.type === "live_session" && <BookOpen className="h-5 w-5 text-blue-500" />}
                          {event.type === "review_session" && <Eye className="h-5 w-5 text-green-500" />}
                          {event.type === "office_hours" && <MessageSquare className="h-5 w-5 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-sm text-muted-foreground">{event.cohort}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">{event.time}</p>
                            </div>
                          </div>
                          {event.attendees > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">{event.attendees} attendees expected</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your mentoring performance metrics over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <ChartContainer
                  config={{
                    engagement: {
                      label: "Student Engagement",
                      color: "hsl(var(--chart-1))",
                    },
                    completion: {
                      label: "Completion Rate",
                      color: "hsl(var(--chart-2))",
                    },
                    satisfaction: {
                      label: "Satisfaction Score",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="w-[942px] h-[530px]"
                >
                  <LineChart data={performanceData} width={942} height={530}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} />
                    <Line type="monotone" dataKey="completion" stroke="var(--color-completion)" strokeWidth={2} />
                    <Line type="monotone" dataKey="satisfaction" stroke="var(--color-satisfaction)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
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
                            <SelectItem value="cohort1">Data Science Bootcamp</SelectItem>
                            <SelectItem value="cohort2">ML Advanced</SelectItem>
                            <SelectItem value="cohort3">Python Fundamentals</SelectItem>
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

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-muted-foreground">john.doe@email.com</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>Data Science Bootcamp</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>2 hours ago</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewStudent("student1")}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">91%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.5h</div>
                  <p className="text-xs text-muted-foreground">Faster than average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Satisfaction</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <p className="text-xs text-muted-foreground">Excellent rating</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Comprehensive view of your mentoring performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    engagement: {
                      label: "Engagement",
                      color: "hsl(var(--chart-1))",
                    },
                    completion: {
                      label: "Completion",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="engagement" fill="var(--color-engagement)" />
                      <Bar dataKey="completion" fill="var(--color-completion)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Curriculum Builder
                  </CardTitle>
                  <CardDescription>Create and organize course content with drag-and-drop</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setCurrentView("curriculum")}>
                    Open Builder
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Communication Center
                  </CardTitle>
                  <CardDescription>Manage messages, announcements, and discussions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setCurrentView("communication")}>
                    Open Center
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Reports & Export
                  </CardTitle>
                  <CardDescription>Generate reports and export student data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Manager
                  </CardTitle>
                  <CardDescription>Manage sessions, office hours, and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Manage Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Assessment Tools
                  </CardTitle>
                  <CardDescription>Create quizzes, assignments, and evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Create Assessment
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Student Support
                  </CardTitle>
                  <CardDescription>Track at-risk students and intervention strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Support Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}