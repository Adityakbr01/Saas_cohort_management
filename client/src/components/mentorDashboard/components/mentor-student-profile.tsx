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
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Activity,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MentorStudentProfileProps {
  studentId: string
  onBack: () => void
}

// Enhanced student data for mentor view
const studentProfileData = {
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
    cohortId: "cohort_1",
    bio: "Aspiring data scientist with a background in economics. Passionate about machine learning and statistical analysis.",
    goals: "To transition into a data science role at a tech company and specialize in predictive analytics.",
    learningStyle: "Visual learner who prefers hands-on projects",
    timezone: "EST (UTC-5)",
    preferredContactMethod: "Email",
    background: {
      education: "Bachelor's in Economics from University of California",
      experience: "2 years as a Business Analyst",
      previousCourses: ["Introduction to Python", "Statistics Fundamentals"],
      skills: ["Excel", "SQL", "Basic Python", "Data Visualization"],
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
        attempts: 1,
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
        attempts: 2,
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
        attempts: 1,
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
        attempts: 0,
      },
    ],
    interactionHistory: [
      {
        id: "1",
        type: "message",
        date: "2024-06-20",
        from: "John Doe",
        to: "Dr. Sarah Johnson",
        subject: "Question about ML assignment",
        content:
          "Hi Dr. Johnson, I'm having trouble with the feature selection part of the ML assignment. Could you provide some guidance?",
        response: "Hi John, I'd be happy to help. Let's schedule a quick call to discuss feature selection techniques.",
        status: "responded",
      },
      {
        id: "2",
        type: "office_hours",
        date: "2024-06-18",
        duration: "30 minutes",
        topic: "Career guidance and ML concepts",
        notes:
          "Discussed career goals and recommended additional resources for machine learning. John is very motivated.",
        followUp: "Send additional reading materials on neural networks",
      },
      {
        id: "3",
        type: "forum_post",
        date: "2024-06-15",
        subject: "Sharing data visualization tips",
        content: "John shared a helpful tutorial on advanced matplotlib techniques with the class.",
        engagement: "High - received 15 likes and 8 comments",
      },
    ],
    mentorNotes: [
      {
        id: "1",
        date: "2024-06-15",
        type: "performance",
        content:
          "John is one of the top performers in the cohort. Shows excellent analytical thinking and is always eager to learn more.",
        priority: "low",
      },
      {
        id: "2",
        date: "2024-06-10",
        type: "engagement",
        content: "Very active in discussions and helps other students. Great team player and natural leader.",
        priority: "low",
      },
      {
        id: "3",
        date: "2024-06-05",
        type: "goal",
        content:
          "Expressed interest in specializing in NLP. Recommended additional resources and suggested connecting with industry professionals.",
        priority: "medium",
      },
    ],
    attendanceHistory: [
      { date: "2024-09-02", status: "present", duration: "3 hours", notes: "Active participation" },
      { date: "2024-09-04", status: "present", duration: "3 hours", notes: "Asked great questions" },
      { date: "2024-09-09", status: "present", duration: "3 hours", notes: "Helped other students" },
      { date: "2024-09-11", status: "present", duration: "3 hours", notes: "Led group discussion" },
      { date: "2024-09-16", status: "absent", duration: "0 hours", notes: "Notified in advance - family emergency" },
      { date: "2024-09-18", status: "present", duration: "3 hours", notes: "Caught up quickly" },
    ],
  },
}

export default function MentorStudentProfile({ studentId, onBack }: MentorStudentProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState("general")
  const [notePriority, setNotePriority] = useState("low")

  const student = studentProfileData[studentId as keyof typeof studentProfileData]

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const handleSaveNote = () => {
    console.log("Saving note:", { type: noteType, content: newNote, priority: notePriority })
    setNewNote("")
    setNoteType("general")
    setNotePriority("low")
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-3xl font-bold">Student Profile</h1>
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
        <Card className="mb-8">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {new Date(student.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last active: {student.lastActive}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{student.goals}</p>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Learning Style</Label>
                    <p className="text-sm text-muted-foreground">{student.learningStyle}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.interactionHistory.slice(0, 3).map((interaction) => (
                    <div key={interaction.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {interaction.type === "message" && <MessageSquare className="h-4 w-4 text-blue-500" />}
                        {interaction.type === "office_hours" && <Calendar className="h-4 w-4 text-green-500" />}
                        {interaction.type === "forum_post" && <FileText className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {interaction.type === "message" && interaction.subject}
                              {interaction.type === "office_hours" && interaction.topic}
                              {interaction.type === "forum_post" && interaction.subject}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {interaction.type === "message" && interaction.content}
                              {interaction.type === "office_hours" && interaction.notes}
                              {interaction.type === "forum_post" && interaction.content}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">{interaction.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress Trends</CardTitle>
                  <CardDescription>Track progress, engagement, and attendance over time</CardDescription>
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

              {/* Skill Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                  <CardDescription>Current proficiency levels across key skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.performanceMetrics.skillProgress.map((skill) => (
                      <div key={skill.skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.skill}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.progress}%</div>
                  <Progress value={student.progress} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Grade</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.grade}</div>
                  <p className="text-xs text-muted-foreground">Above average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.attendanceRate}%</div>
                  <p className="text-xs text-muted-foreground">Excellent attendance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.engagementScore}</div>
                  <p className="text-xs text-muted-foreground">Highly engaged</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment History</CardTitle>
                <CardDescription>Track all assignments and their completion status</CardDescription>
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
                      <TableHead>Attempts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            {assignment.feedback && (
                              <p className="text-sm text-muted-foreground mt-1">{assignment.feedback}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {assignment.submittedDate
                            ? new Date(assignment.submittedDate).toLocaleDateString()
                            : "Not submitted"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getAssignmentStatusColor(assignment.status)}>{assignment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.score ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{assignment.score}%</span>
                              {assignment.score >= 90 && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{assignment.timeSpent}</TableCell>
                        <TableCell>{assignment.attempts}</TableCell>
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
                <CardDescription>All communications and interactions with the student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.interactionHistory.map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{interaction.type.replace("_", " ")}</Badge>
                          {interaction.type === "message" && <h4 className="font-medium">{interaction.subject}</h4>}
                          {interaction.type === "office_hours" && <h4 className="font-medium">{interaction.topic}</h4>}
                          {interaction.type === "forum_post" && <h4 className="font-medium">{interaction.subject}</h4>}
                        </div>
                        <span className="text-sm text-muted-foreground">{interaction.date}</span>
                      </div>

                      {interaction.type === "message" && (
                        <div className="space-y-2">
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm">
                              <strong>Student:</strong> {interaction.content}
                            </p>
                          </div>
                          {interaction.response && (
                            <div className="bg-primary/5 p-3 rounded">
                              <p className="text-sm">
                                <strong>Mentor:</strong> {interaction.response}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {interaction.type === "office_hours" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Duration:</strong> {interaction.duration}
                          </p>
                          <p className="text-sm">
                            <strong>Notes:</strong> {interaction.notes}
                          </p>
                          {interaction.followUp && (
                            <p className="text-sm">
                              <strong>Follow-up:</strong> {interaction.followUp}
                            </p>
                          )}
                        </div>
                      )}

                      {interaction.type === "forum_post" && (
                        <div className="space-y-2">
                          <p className="text-sm">{interaction.content}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Engagement:</strong> {interaction.engagement}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {/* Add New Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Note</CardTitle>
                <CardDescription>
                  Record observations, feedback, or important information about the student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Note Type</Label>
                    <Select value={noteType} onValueChange={setNoteType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="goal">Goal Setting</SelectItem>
                        <SelectItem value="concern">Concern</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={notePriority} onValueChange={setNotePriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note Content</Label>
                  <Textarea
                    placeholder="Enter your note about the student..."
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

            {/* Existing Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.mentorNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{note.type}</Badge>
                          <Badge variant={getPriorityColor(note.priority)}>{note.priority}</Badge>
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

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Background Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Background Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Education</Label>
                    <p className="text-sm text-muted-foreground">{student.background.education}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Experience</Label>
                    <p className="text-sm text-muted-foreground">{student.background.experience}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Previous Courses</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {student.background.previousCourses.map((course) => (
                        <Badge key={course} variant="outline">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {student.background.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.attendanceHistory.slice(0, 6).map((attendance, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              attendance.status === "present" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">{new Date(attendance.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{attendance.status}</p>
                          <p className="text-xs text-muted-foreground">{attendance.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Student Preferences</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Timezone</Label>
                  <p className="text-sm text-muted-foreground">{student.timezone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preferred Contact</Label>
                  <p className="text-sm text-muted-foreground">{student.preferredContactMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Learning Style</Label>
                  <p className="text-sm text-muted-foreground">{student.learningStyle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Submission</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(student.lastSubmission).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
