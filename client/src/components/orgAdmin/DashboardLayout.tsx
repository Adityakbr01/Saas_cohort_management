"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  BarChart3,
  Activity,
  Shield,
  UserPlus,
  Clock,
  Target,
  Award,
  Filter,
  RefreshCw,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts"

// Import the new components
import MentorProfileView from "./pages/Mentor_profile_page"
import CohortDetailView from "./pages/CohortDetailView"
import StudentProfileView from "./pages/student-profile-view"

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
    status: "active",
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
    status: "active",
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false)
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, mentor, cohort, student

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Monthly performance metrics across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      mentorPerformance: {
                        label: "Mentor Performance",
                        color: "hsl(var(--chart-1))",
                      },
                      studentEngagement: {
                        label: "Student Engagement",
                        color: "hsl(var(--chart-2))",
                      },
                      completionRate: {
                        label: "Completion Rate",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="mentorPerformance"
                          stroke="var(--color-mentorPerformance)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="studentEngagement"
                          stroke="var(--color-studentEngagement)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="completionRate"
                          stroke="var(--color-completionRate)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Specialization Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Specialization Distribution</CardTitle>
                  <CardDescription>Distribution of mentors across specializations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Mentors",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={specializationData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {specializationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Cohort Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Active Cohorts Progress</CardTitle>
                <CardDescription>Real-time progress tracking for all active cohorts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    progress: {
                      label: "Progress %",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Org Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search administrators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="mentor-manager">Mentor Manager</SelectItem>
                    <SelectItem value="analytics-manager">Analytics Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Organization Administrator</DialogTitle>
                    <DialogDescription>Add a new administrator with specific roles and permissions.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter email address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super-admin">Super Admin</SelectItem>
                          <SelectItem value="mentor-manager">Mentor Manager</SelectItem>
                          <SelectItem value="analytics-manager">Analytics Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" placeholder="Enter department" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mentor-management" />
                          <Label htmlFor="mentor-management">Mentor Management</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="cohort-management" />
                          <Label htmlFor="cohort-management">Cohort Management</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="analytics-view" />
                          <Label htmlFor="analytics-view">Analytics View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="user-management" />
                          <Label htmlFor="user-management">User Management</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateAdminOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateAdminOpen(false)}>Create Administrator</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Organization Administrators</CardTitle>
                <CardDescription>Manage administrator accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Managed Mentors</TableHead>
                      <TableHead>Managed Cohorts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={admin.avatar || "/placeholder.svg"} alt={admin.name} />
                              <AvatarFallback>
                                {admin.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{admin.name}</p>
                              <p className="text-sm text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"}>{admin.role}</Badge>
                        </TableCell>
                        <TableCell>{admin.managedMentors}</TableCell>
                        <TableCell>{admin.managedCohorts}</TableCell>
                        <TableCell>
                          <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                        </TableCell>
                        <TableCell>{admin.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Mentors Tab */}
          <TabsContent value="mentors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                    <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Mentor
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mentors Overview</CardTitle>
                <CardDescription>
                  Click on a mentor to view detailed information and manage their cohorts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Cohorts</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.map((mentor) => (
                      <TableRow key={mentor.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                              <AvatarFallback>
                                {mentor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{mentor.name}</p>
                              <p className="text-sm text-muted-foreground">{mentor.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{mentor.specialization}</TableCell>
                        <TableCell>{mentor.studentsCount}</TableCell>
                        <TableCell>{mentor.cohortsCount}</TableCell>
                        <TableCell>{mentor.rating}</TableCell>
                        <TableCell>
                          <Badge variant={mentor.status === "active" ? "default" : "secondary"}>{mentor.status}</Badge>
                        </TableCell>
                        <TableCell>{mentor.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewMentor(mentor.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Mentor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isCreateCohortOpen} onOpenChange={setIsCreateCohortOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Cohort
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Cohort</DialogTitle>
                    <DialogDescription>Set up a new learning cohort with mentor assignment.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="cohort-name">Cohort Name</Label>
                      <Input id="cohort-name" placeholder="Enter cohort name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mentor">Assign Mentor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name} - {mentor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="web-dev">Web Development</SelectItem>
                          <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                          <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input id="end-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Max Capacity</Label>
                      <Input id="capacity" type="number" placeholder="Enter max students" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter cohort description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateCohortOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateCohortOpen(false)}>Create Cohort</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {cohorts.map((cohort) => (
                <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cohort.name}</CardTitle>
                        <CardDescription>
                          {cohort.category} • {cohort.difficulty}
                        </CardDescription>
                      </div>
                      <Badge variant={cohort.status === "active" ? "default" : "secondary"}>{cohort.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{cohort.progress}%</span>
                      </div>
                      <Progress value={cohort.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students:</span>
                        <span className="ml-1 font-medium">
                          {cohort.studentsCount}/{cohort.maxCapacity}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mentor:</span>
                        <span className="ml-1 font-medium">{cohort.mentor}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleViewCohort(cohort.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewMentor(cohort.mentorId)}>
                        <Users className="h-4 w-4 mr-2" />
                        View Mentor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                  <div className="mt-4">
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mentor Performance</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">91%</div>
                  <p className="text-xs text-muted-foreground">Average performance score</p>
                  <div className="mt-4">
                    <Progress value={91} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">Overall completion rate</p>
                  <div className="mt-4">
                    <Progress value={87} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time to Complete</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5</div>
                  <p className="text-xs text-muted-foreground">Average weeks</p>
                  <div className="mt-4">
                    <Progress value={65} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Trends</CardTitle>
                  <CardDescription>Track key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      mentorPerformance: {
                        label: "Mentor Performance",
                        color: "hsl(var(--chart-1))",
                      },
                      studentEngagement: {
                        label: "Student Engagement",
                        color: "hsl(var(--chart-2))",
                      },
                      completionRate: {
                        label: "Completion Rate",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="mentorPerformance"
                          stroke="var(--color-mentorPerformance)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="studentEngagement"
                          stroke="var(--color-studentEngagement)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="completionRate"
                          stroke="var(--color-completionRate)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort Performance Comparison</CardTitle>
                  <CardDescription>Compare progress across active cohorts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      progress: {
                        label: "Progress %",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cohortProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="progress" fill="var(--color-progress)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics Report</CardTitle>
                <CardDescription>Comprehensive insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,250</div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-xs text-green-600">+15.2% growth</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,087</div>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                    <p className="text-xs text-green-600">87% engagement</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">892</div>
                    <p className="text-sm text-muted-foreground">Completed Courses</p>
                    <p className="text-xs text-green-600">71% completion rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <p className="text-sm text-muted-foreground">At-Risk Students</p>
                    <p className="text-xs text-red-600">Needs intervention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role & Permission Management</CardTitle>
                  <CardDescription>Configure roles and permissions for organization administrators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Super Admin</h4>
                        <Badge>Full Access</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete access to all features and administrative functions
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>User Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Mentor Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Cohort Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Analytics & Reporting</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Mentor Manager</h4>
                        <Badge variant="secondary">Limited Access</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Access to mentor and cohort management features
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>User Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Mentor Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Cohort Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Analytics View Only</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Analytics Manager</h4>
                        <Badge variant="outline">Read Only</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Access to analytics, reporting, and data export features
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>User Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Mentor Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Cohort Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Analytics & Reporting</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Role
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Configure organization-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Notification Settings</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS Alerts for Critical Issues</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly Performance Reports</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Student At-Risk Alerts</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Data Retention Policy</Label>
                      <Select defaultValue="24">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Auto-backup Schedule</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Session Timeout</Label>
                      <Select defaultValue="8">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Export & Integration</CardTitle>
                <CardDescription>Export data and manage system integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Analytics Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    User Directory
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Scheduled Exports</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Enable automatic weekly exports</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Manage security settings and compliance requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require 2FA for all admins</span>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password Policy</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enforce strong passwords</span>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Login Monitoring</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Log all admin activities</span>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Encryption</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Encrypt sensitive data</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Compliance Standards</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="gdpr" defaultChecked />
                      <Label htmlFor="gdpr" className="text-sm">
                        GDPR Compliance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ferpa" defaultChecked />
                      <Label htmlFor="ferpa" className="text-sm">
                        FERPA Compliance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="coppa" />
                      <Label htmlFor="coppa" className="text-sm">
                        COPPA Compliance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sox" />
                      <Label htmlFor="sox" className="text-sm">
                        SOX Compliance
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
