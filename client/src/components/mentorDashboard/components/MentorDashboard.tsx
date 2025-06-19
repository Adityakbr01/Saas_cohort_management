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
import {
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Eye,
  Edit,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Download,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

// Import specialized components
import CohortManagement from "./cohort-management"
import StudentManagement from "./student-management"
import CurriculumBuilder from "./curriculum-builder"
import MentorStudentProfile from "./mentor-student-profile"
import CommunicationCenter from "./communication-center"

// Mock data for mentor dashboard
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
}

const dashboardStats = {
  totalStudents: 45,
  activeStudents: 42,
  atRiskStudents: 3,
  activeCohorts: 3,
  averageProgress: 78,
  completionRate: 92,
  monthlyGrowth: 12.5,
}

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
]

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
]

const performanceData = [
  { month: "Jan", engagement: 85, completion: 88, satisfaction: 4.7 },
  { month: "Feb", engagement: 88, completion: 90, satisfaction: 4.8 },
  { month: "Mar", engagement: 92, completion: 92, satisfaction: 4.9 },
  { month: "Apr", engagement: 89, completion: 89, satisfaction: 4.8 },
  { month: "May", engagement: 94, completion: 94, satisfaction: 4.9 },
  { month: "Jun", engagement: 91, completion: 92, satisfaction: 4.9 },
]

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, cohort, student, curriculum, communication

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
    setSelectedCohort(null)
    setSelectedStudent(null)
  }

  // Render different views based on current state
  if (currentView === "cohort" && selectedCohort) {
    return (
      <CohortManagement
        cohortId={selectedCohort}
        onBack={handleBackToDashboard}
        onViewStudent={handleViewStudent}
        onEditCurriculum={() => setCurrentView("curriculum")}
      />
    )
  }

  if (currentView === "student" && selectedStudent) {
    return (
      <MentorStudentProfile
        studentId={selectedStudent}
        onBack={() => {
          if (selectedCohort) {
            setCurrentView("cohort")
          } else {
            handleBackToDashboard()
          }
        }}
      />
    )
  }

  if (currentView === "curriculum") {
    return <CurriculumBuilder cohortId={selectedCohort || ""} onBack={() => setCurrentView("cohort")} />
  }

  if (currentView === "communication") {
    return <CommunicationCenter onBack={handleBackToDashboard} />
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
                  .map((n) => n[0])
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
                    {recentActivity.map((activity) => (
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
                    {upcomingEvents.map((event) => (
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
              <CardContent>
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
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} />
                      <Line type="monotone" dataKey="completion" stroke="var(--color-completion)" strokeWidth={2} />
                      <Line type="monotone" dataKey="satisfaction" stroke="var(--color-satisfaction)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Cohorts</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Cohort
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Cohort</DialogTitle>
                    <DialogDescription>Set up a new learning cohort for your students.</DialogDescription>
                  </DialogHeader>
                  {/* Cohort creation form would go here */}
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cohort Name</label>
                      <Input placeholder="Enter cohort name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="web-dev">Web Development</SelectItem>
                          <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration (weeks)</label>
                      <Input type="number" placeholder="12" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Cohort</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <StudentManagement onViewCohort={handleViewCohort} onViewStudent={handleViewStudent} />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Students</h3>
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
                    {/* Student creation form would go here */}
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
                    {/* Sample student data */}
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
  )
}
