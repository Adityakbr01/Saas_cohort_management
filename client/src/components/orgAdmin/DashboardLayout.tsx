import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  BookOpen,
  Download,
  GraduationCap,
  RefreshCw,
  Shield,
  TrendingUp,
  Users
} from "lucide-react"
import { useState } from "react"

// Import the new components
import CohortDetailView from "./pages/CohortDetailView"
import MentorProfileView from "./pages/Mentor_profile_page"
import StudentProfileView from "./pages/student-profile-view"
import MentorsTab from "./Tabs/MentorsTab"
import OverviewTab from "./Tabs/OverviewTab"
import AdminsTab from "./Tabs/AdminsTab"
import CohortsTab from "./Tabs/CohortsTab"
import AnalyticsTab from "./Tabs/AnalyticsTab"
import SettingsTab from "./Tabs/SettingsTab"

// Mock data for org admins
const orgAdmins = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@edulaunch.com",
    role: "Super Admin",
    permissions: ["all"],
    status: "active",
    lastLogin: "2 hours ago",
    joinDate: "2023-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
    managedMentors: 15,
    managedCohorts: 8,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah.wilson@edulaunch.com",
    role: "Mentor Manager",
    permissions: ["mentor_management", "cohort_management", "analytics_view"],
    status: "active",
    lastLogin: "1 day ago",
    joinDate: "2023-02-20",
    avatar: "/placeholder.svg?height=40&width=40",
    managedMentors: 8,
    managedCohorts: 5,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@edulaunch.com",
    role: "Analytics Manager",
    permissions: ["analytics_view", "reporting", "data_export"],
    status: "inactive",
    lastLogin: "1 week ago",
    joinDate: "2023-03-10",
    avatar: "/placeholder.svg?height=40&width=40",
    managedMentors: 0,
    managedCohorts: 0,
  },
]

// Enhanced mentor data
const mentors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@edulaunch.com",
    phone: "+1 (555) 123-4567",
    specialization: "Data Science",
    experience: "8 years",
    rating: 4.9,
    studentsCount: 45,
    cohortsCount: 3,
    status: "active" as const,
    joinDate: "2023-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
    lastActive: "2 hours ago",
    completionRate: 92,
    satisfactionScore: 4.8,
    certifications: ["AWS Certified", "Google Cloud Professional"],
    bio: "Experienced data scientist with expertise in machine learning and AI.",
    assignedBy: "John Smith",
    performance: {
      monthlyProgress: [85, 88, 92, 89, 94, 91],
      studentSatisfaction: [4.6, 4.7, 4.8, 4.9, 4.8, 4.9],
    },
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@edulaunch.com",
    phone: "+1 (555) 234-5678",
    specialization: "Web Development",
    experience: "6 years",
    rating: 4.8,
    studentsCount: 38,
    cohortsCount: 2,
    status: "active" as const,
    joinDate: "2023-02-20",
    avatar: "/placeholder.svg?height=40&width=40",
    lastActive: "1 day ago",
    completionRate: 88,
    satisfactionScore: 4.7,
    certifications: ["React Certified", "Node.js Expert"],
    bio: "Full-stack developer specializing in modern web technologies.",
    assignedBy: "Sarah Wilson",
    performance: {
      monthlyProgress: [82, 85, 88, 86, 90, 88],
      studentSatisfaction: [4.5, 4.6, 4.7, 4.8, 4.7, 4.8],
    },
  },
]

// Enhanced cohort data
const cohorts = [
  {
    id: "1",
    name: "Data Science Bootcamp - Fall 2024",
    mentor: "Dr. Sarah Johnson",
    mentorId: "1",
    startDate: "2024-09-01",
    endDate: "2024-12-15",
    studentsCount: 25,
    maxCapacity: 30,
    status: "active",
    progress: 65,
    completionRate: 92,
    category: "Data Science",
    difficulty: "Intermediate",
    createdBy: "John Smith",
    students: [
      {
        id: "s1",
        name: "John Doe",
        email: "john.doe@email.com",
        progress: 78,
        lastActive: "2 hours ago",
        status: "active",
        joinDate: "2024-09-01",
        assignments: 12,
        completedAssignments: 9,
        grade: "A-",
      },
      {
        id: "s2",
        name: "Jane Smith",
        email: "jane.smith@email.com",
        progress: 85,
        lastActive: "1 day ago",
        status: "active",
        joinDate: "2024-09-01",
        assignments: 12,
        completedAssignments: 10,
        grade: "A",
      },
      {
        id: "s3",
        name: "Bob Wilson",
        email: "bob.wilson@email.com",
        progress: 45,
        lastActive: "3 days ago",
        status: "at-risk",
        joinDate: "2024-09-01",
        assignments: 12,
        completedAssignments: 5,
        grade: "C",
      },
    ],
  },
]

// Analytics data
const performanceData = [
  { month: "Jan", mentorPerformance: 85, studentEngagement: 78, completionRate: 82 },
  { month: "Feb", mentorPerformance: 88, studentEngagement: 82, completionRate: 85 },
  { month: "Mar", mentorPerformance: 92, studentEngagement: 85, completionRate: 88 },
  { month: "Apr", mentorPerformance: 89, studentEngagement: 88, completionRate: 90 },
  { month: "May", mentorPerformance: 94, studentEngagement: 91, completionRate: 92 },
  { month: "Jun", mentorPerformance: 91, studentEngagement: 89, completionRate: 89 },
]

const specializationData = [
  { name: "Data Science", value: 35, color: "#8884d8" },
  { name: "Web Development", value: 28, color: "#82ca9d" },
  { name: "Mobile Development", value: 20, color: "#ffc658" },
  { name: "UI/UX Design", value: 17, color: "#ff7300" },
]

const cohortProgressData = [
  { name: "Data Science Bootcamp", progress: 65, students: 25 },
  { name: "React Development", progress: 40, students: 20 },
  { name: "UI/UX Fundamentals", progress: 80, students: 18 },
  { name: "Mobile App Development", progress: 55, students: 22 },
]

export default function OrgAdminDashboard() {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, mentor, cohort, student

  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  const dashboardStats = {
    totalOrgAdmins: orgAdmins.length,
    totalMentors: mentors.length,
    totalStudents: 1250,
    activeCohorts: 12,
    completionRate: 87,
    monthlyGrowth: 15.2,
  }

  const handleViewMentor = (mentorId: string) => {
    setSelectedMentor(mentorId)
    setCurrentView("mentor")
  }

  const handleViewCohort = (cohortId: string) => {
    setSelectedCohort(cohortId)
    setCurrentView("cohort")
  }

  const handleViewStudent = (studentId: string) => {
    setSelectedStudent(studentId)
    setCurrentView("student")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedMentor(null)
    setSelectedCohort(null)
    setSelectedStudent(null)
  }

  // Render different views based on current state
  if (currentView === "mentor" && selectedMentor) {
    return (
      <MentorProfileView mentorId={selectedMentor} onClose={handleBackToDashboard} onViewCohort={handleViewCohort} />
    )
  }

  if (currentView === "cohort" && selectedCohort) {
    return (
      <CohortDetailView
        cohortId={selectedCohort}
        onClose={() => {
          if (selectedMentor) {
            setCurrentView("mentor")
          } else {
            handleBackToDashboard()
          }
        }}
        onViewStudent={handleViewStudent}
      />
    )
  }

  if (currentView === "student" && selectedStudent) {
    return (
      <StudentProfileView
        studentId={selectedStudent}
        cohortId={selectedCohort || "1"}
        onClose={() => {
          if (selectedCohort) {
            setCurrentView("cohort")
          } else {
            handleBackToDashboard()
          }
        }}
      />
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Organization Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage administrators, mentors, cohorts, and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Org Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrgAdmins}</div>
              <p className="text-xs text-muted-foreground">+1 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalMentors}</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth}% growth</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeCohorts}</div>
              <p className="text-xs text-muted-foreground">2 starting next week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">+2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admins">Org Admins</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              performanceData={performanceData}
              specializationData={specializationData}
              cohortProgressData={cohortProgressData}
            />
          </TabsContent>

          {/* Org Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <AdminsTab
              orgAdmins={orgAdmins}
              searchTerm={adminSearchTerm}
              setSearchTerm={setAdminSearchTerm}
              isCreateAdminOpen={isCreateAdminOpen}
              setIsCreateAdminOpen={setIsCreateAdminOpen}
            />
          </TabsContent>

          {/* Enhanced Mentors Tab */}
          <TabsContent value="mentors" className="space-y-6">
            <MentorsTab
              onViewMentor={handleViewMentor}
              apiBaseUrl="/api"
            />
          </TabsContent>

          {/* Enhanced Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <CohortsTab
              cohorts={cohorts}
              mentors={mentors}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              isCreateCohortOpen={isCreateCohortOpen}
              setIsCreateCohortOpen={setIsCreateCohortOpen}
              handleViewCohort={handleViewCohort}
              handleViewMentor={handleViewMentor}
            />
          </TabsContent>

          {/* Enhanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab
              performanceData={performanceData}
              cohortProgressData={cohortProgressData}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
