"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Activity,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

interface StudentProfileViewProps {
  studentId: string
  cohortId: string
  onClose: () => void
}

// Enhanced student data
const studentDetails = {
  s1: {
    id: "s1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 987-6543",
    avatar: "/placeholder.svg?height=120&width=120",
    joinDate: "2024-09-01",
    status: "active",
    progress: 78,
    grade: "A-",
    attendanceRate: 95,
    engagementScore: 88,
    lastActive: "2 hours ago",
    lastSubmission: "2024-06-20",
    cohort: "Data Science Bootcamp - Fall 2024",
    mentor: "Dr. Sarah Johnson",
    bio: "Aspiring data scientist with a background in economics. Passionate about machine learning and statistical analysis.",
    goals: "To transition into a data science role at a tech company and specialize in predictive analytics.",
    background: {
      education: "Bachelor's in Economics from University of California",
      experience: "2 years as a Business Analyst",
      previousCourses: ["Introduction to Python", "Statistics Fundamentals"],
    },
    performanceMetrics: {
      weeklyProgress: [
        { week: "Week 1", progress: 95, engagement: 90, attendance: 100 },
        { week: "Week 2", progress: 88, engagement: 85, attendance: 100 },
        { week: "Week 3", progress: 82, engagement: 80, attendance: 90 },
        { week: "Week 4", progress: 85, engagement: 88, attendance: 95 },
        { week: "Week 5", progress: 78, engagement: 85, attendance: 95 },
        { week: "Week 6", progress: 80, engagement: 88, attendance: 100 },
      ],
      skillProgress: [
        { skill: "Python", level: 85 },
        { skill: "Statistics", level: 78 },
        { skill: "Data Visualization", level: 82 },
        { skill: "Machine Learning", level: 65 },
        { skill: "SQL", level: 70 },
      ],
    },
    assignments: [
      {
        id: "a1",
        title: "Python Basics Assessment",
        dueDate: "2024-09-15",
        submittedDate: "2024-09-14",
        status: "completed",
        score: 92,
        feedback: "Excellent work! Shows strong understanding of Python fundamentals.",
        timeSpent: "4 hours",
      },
      {
        id: "a2",
        title: "Data Cleaning Project",
        dueDate: "2024-10-01",
        submittedDate: "2024-09-30",
        status: "completed",
        score: 88,
        feedback: "Good approach to data cleaning. Consider exploring more advanced techniques.",
        timeSpent: "6 hours",
      },
      {
        id: "a3",
        title: "Statistical Analysis Report",
        dueDate: "2024-10-15",
        submittedDate: "2024-10-14",
        status: "completed",
        score: 85,
        feedback: "Solid analysis. Work on presenting findings more clearly.",
        timeSpent: "8 hours",
      },
      {
        id: "a4",
        title: "Machine Learning Model",
        dueDate: "2024-11-01",
        submittedDate: null,
        status: "in-progress",
        score: null,
        feedback: null,
        timeSpent: "3 hours",
      },
    ],
    interactionHistory: [
      {
        id: "1",
        type: "message",
        date: "2024-06-20",
        from: "Dr. Sarah Johnson",
        subject: "Great progress on latest assignment",
        content: "John, your statistical analysis was very thorough. Keep up the excellent work!",
      },
      {
        id: "2",
        type: "forum_post",
        date: "2024-06-19",
        from: "John Doe",
        subject: "Question about hypothesis testing",
        content: "I'm having trouble understanding when to use a one-tailed vs two-tailed test. Can someone help?",
      },
      {
        id: "3",
        type: "office_hours",
        date: "2024-06-18",
        from: "Dr. Sarah Johnson",
        subject: "One-on-one session",
        content: "Discussed career goals and recommended additional resources for machine learning.",
      },
    ],
    notes: [
      {
        id: "1",
        author: "Dr. Sarah Johnson",
        date: "2024-06-15",
        type: "performance",
        content: "John is one of the top performers in the cohort. Shows excellent analytical thinking.",
      },
      {
        id: "2",
        author: "Dr. Sarah Johnson",
        date: "2024-06-10",
        type: "engagement",
        content: "Very active in discussions and helps other students. Great team player.",
      },
    ],
    attendanceHistory: [
      { date: "2024-09-02", status: "present", duration: "3 hours" },
      { date: "2024-09-04", status: "present", duration: "3 hours" },
      { date: "2024-09-09", status: "present", duration: "3 hours" },
      { date: "2024-09-11", status: "present", duration: "3 hours" },
      { date: "2024-09-16", status: "absent", duration: "0 hours" },
      { date: "2024-09-18", status: "present", duration: "3 hours" },
    ],
  },
  s3: {
    id: "s3",
    name: "Bob Wilson",
    email: "bob.wilson@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "/placeholder.svg?height=120&width=120",
    joinDate: "2024-09-01",
    status: "at-risk",
    progress: 45,
    grade: "C",
    attendanceRate: 70,
    engagementScore: 65,
    lastActive: "3 days ago",
    lastSubmission: "2024-06-15",
    cohort: "Data Science Bootcamp - Fall 2024",
    mentor: "Dr. Sarah Johnson",
    bio: "Career changer from retail management looking to break into tech. Motivated but struggling with technical concepts.",
    goals: "To successfully complete the bootcamp and secure an entry-level data analyst position.",
    background: {
      education: "High School Diploma",
      experience: "5 years in retail management",
      previousCourses: ["Basic Computer Skills"],
    },
    performanceMetrics: {
      weeklyProgress: [
        { week: "Week 1", progress: 75, engagement: 80, attendance: 100 },
        { week: "Week 2", progress: 65, engagement: 70, attendance: 80 },
        { week: "Week 3", progress: 55, engagement: 65, attendance: 60 },
        { week: "Week 4", progress: 50, engagement: 60, attendance: 70 },
        { week: "Week 5", progress: 45, engagement: 65, attendance: 70 },
        { week: "Week 6", progress: 45, engagement: 65, attendance: 80 },
      ],
      skillProgress: [
        { skill: "Python", level: 45 },
        { skill: "Statistics", level: 40 },
        { skill: "Data Visualization", level: 50 },
        { skill: "Machine Learning", level: 25 },
        { skill: "SQL", level: 35 },
      ],
    },
    assignments: [
      {
        id: "a1",
        title: "Python Basics Assessment",
        dueDate: "2024-09-15",
        submittedDate: "2024-09-16",
        status: "completed",
        score: 65,
        feedback: "Shows basic understanding but needs more practice with syntax and logic.",
        timeSpent: "8 hours",
      },
      {
        id: "a2",
        title: "Data Cleaning Project",
        dueDate: "2024-10-01",
        submittedDate: "2024-10-03",
        status: "completed",
        score: 58,
        feedback: "Struggled with pandas operations. Recommend additional practice sessions.",
        timeSpent: "12 hours",
      },
      {
        id: "a3",
        title: "Statistical Analysis Report",
        dueDate: "2024-10-15",
        submittedDate: null,
        status: "overdue",
        score: null,
        feedback: null,
        timeSpent: "2 hours",
      },
    ],
    interactionHistory: [
      {
        id: "1",
        type: "message",
        date: "2024-06-18",
        from: "Dr. Sarah Johnson",
        subject: "Additional support available",
        content: "Bob, I've noticed you're struggling with some concepts. Let's schedule extra office hours.",
      },
      {
        id: "2",
        type: "support_session",
        date: "2024-06-16",
        from: "Dr. Sarah Johnson",
        subject: "Extra help session",
        content: "Worked on Python fundamentals and provided additional resources.",
      },
    ],
    notes: [
      {
        id: "1",
        author: "Dr. Sarah Johnson",
        date: "2024-06-15",
        type: "concern",
        content: "Bob is falling behind and needs additional support. Recommended tutoring sessions.",
      },
      {
        id: "2",
        author: "Dr. Sarah Johnson",
        date: "2024-06-12",
        type: "intervention",
        content: "Scheduled weekly one-on-one sessions to help with technical concepts.",
      },
    ],
    attendanceHistory: [
      { date: "2024-09-02", status: "present", duration: "3 hours" },
      { date: "2024-09-04", status: "absent", duration: "0 hours" },
      { date: "2024-09-09", status: "present", duration: "2 hours" },
      { date: "2024-09-11", status: "absent", duration: "0 hours" },
      { date: "2024-09-16", status: "present", duration: "3 hours" },
      { date: "2024-09-18", status: "present", duration: "3 hours" },
    ],
  },
}

export default function StudentProfileView({ studentId, cohortId, onClose }: StudentProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState("general")

  console.log(cohortId)

  const student = studentDetails[studentId as keyof typeof studentDetails]

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const handleSaveNote = () => {
    console.log("Saving note:", { type: noteType, content: newNote })
    setNewNote("")
    setNoteType("general")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "at-risk":
        return "destructive"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Back to Cohort
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Student Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback className="text-2xl">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <Badge variant={getStatusColor(student.status)}>{student.status}</Badge>
                {student.status === "at-risk" && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Needs Attention
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{student.cohort}</p>
              <p className="text-sm text-muted-foreground mb-4">{student.bio}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{student.progress}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{student.grade}</div>
                  <div className="text-sm text-muted-foreground">Current Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{student.attendanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{student.engagementScore}</div>
                  <div className="text-sm text-muted-foreground">Engagement</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{student.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">{student.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Active</p>
                    <p className="text-sm text-muted-foreground">{student.lastActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background & Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Background & Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Education</p>
                  <p className="text-sm text-muted-foreground">{student.background.education}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Experience</p>
                  <p className="text-sm text-muted-foreground">{student.background.experience}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Learning Goals</p>
                  <p className="text-sm text-muted-foreground">{student.goals}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Previous Courses</p>
                  <div className="flex flex-wrap gap-1">
                    {student.background.previousCourses.map((course, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress</CardTitle>
              <CardDescription>Current proficiency levels across key skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.performanceMetrics.skillProgress.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.skill}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.progress}%</div>
                <p className="text-xs text-muted-foreground">Course completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.engagementScore}</div>
                <p className="text-xs text-muted-foreground">Participation level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Grade</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.grade}</div>
                <p className="text-xs text-muted-foreground">Academic performance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Progress, engagement, and attendance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  progress: {
                    label: "Progress",
                    color: "hsl(var(--chart-1))",
                  },
                  engagement: {
                    label: "Engagement",
                    color: "hsl(var(--chart-2))",
                  },
                  attendance: {
                    label: "Attendance",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student.performanceMetrics.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="progress" stroke="var(--color-progress)" strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} />
                    <Line type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Proficiency</CardTitle>
              <CardDescription>Current skill levels across different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  level: {
                    label: "Proficiency Level",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.performanceMetrics.skillProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="level" fill="var(--color-level)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>All assignments and their completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {assignment.submittedDate
                          ? new Date(assignment.submittedDate).toLocaleDateString()
                          : "Not submitted"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAssignmentStatusColor(assignment.status)}>{assignment.status}</Badge>
                      </TableCell>
                      <TableCell>{assignment.score ? `${assignment.score}%` : "-"}</TableCell>
                      <TableCell>{assignment.timeSpent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Assignment Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Instructor feedback on completed assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.assignments
                  .filter((a) => a.feedback)
                  .map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <Badge variant="outline">{assignment.score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">Overall attendance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Attended</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.attendanceHistory.filter((a) => a.status === "present").length}
                </div>
                <p className="text-xs text-muted-foreground">Out of {student.attendanceHistory.length} sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.attendanceHistory.reduce((total, session) => total + Number.parseInt(session.duration), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Hours attended</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Detailed attendance record for all sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.attendanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "present" ? "default" : "destructive"}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{record.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interaction History</CardTitle>
              <CardDescription>All communications and interactions with mentors and peers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.interactionHistory.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{interaction.type}</Badge>
                        <h4 className="font-medium">{interaction.subject}</h4>
                      </div>
                      <span className="text-sm text-muted-foreground">{interaction.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">From: {interaction.from}</p>
                    <p className="text-sm">{interaction.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Note</CardTitle>
              <CardDescription>Add notes about student performance, behavior, or observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="note-type">Note Type</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="concern">Concern</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="intervention">Intervention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveNote} disabled={!newNote.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previous Notes</CardTitle>
              <CardDescription>Historical notes and observations about this student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.type}</Badge>
                        <span className="font-medium">{note.author}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
