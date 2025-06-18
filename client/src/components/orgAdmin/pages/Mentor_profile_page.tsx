"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Users,
    Mail,
    Phone,
    Calendar,
    Star,
    TrendingUp,
    MessageSquare,
    Edit,
    Save,
    X,
    Plus,
    Eye,
    BarChart3,
    Clock,
    Award,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MentorProfileViewProps {
    mentorId: string
    onClose: () => void
    onViewCohort: (cohortId: string) => void
}

// Enhanced mentor data with more details
const mentorDetails = {
    "1": {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@edulaunch.com",
        phone: "+1 (555) 123-4567",
        avatar: "/placeholder.svg?height=120&width=120",
        specialization: "Data Science",
        experience: "8 years",
        joinDate: "2023-01-15",
        status: "active",
        rating: 4.9,
        totalStudents: 145,
        activeStudents: 45,
        completedCohorts: 8,
        activeCohorts: 3,
        bio: "Experienced data scientist with expertise in machine learning, AI, and statistical analysis. Former lead data scientist at Google with a passion for teaching and mentoring the next generation of data professionals.",
        education: [
            { degree: "PhD in Computer Science", institution: "Stanford University", year: "2015" },
            { degree: "MS in Statistics", institution: "MIT", year: "2011" },
            { degree: "BS in Mathematics", institution: "UC Berkeley", year: "2009" },
        ],
        certifications: [
            { name: "AWS Certified Machine Learning", issuer: "Amazon", date: "2023-06-15" },
            { name: "Google Cloud Professional Data Engineer", issuer: "Google", date: "2023-03-20" },
            { name: "Certified Analytics Professional", issuer: "INFORMS", date: "2022-11-10" },
        ],
        skills: ["Python", "R", "SQL", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy"],
        performanceMetrics: {
            overallRating: 4.9,
            studentSatisfaction: 4.8,
            completionRate: 92,
            responseTime: "< 2 hours",
            sessionAttendance: 98,
            monthlyProgress: [
                { month: "Jan", satisfaction: 4.6, completion: 88, engagement: 85 },
                { month: "Feb", satisfaction: 4.7, completion: 90, engagement: 87 },
                { month: "Mar", satisfaction: 4.8, completion: 92, engagement: 89 },
                { month: "Apr", satisfaction: 4.9, completion: 91, engagement: 91 },
                { month: "May", satisfaction: 4.8, completion: 94, engagement: 93 },
                { month: "Jun", satisfaction: 4.9, completion: 92, engagement: 90 },
            ],
        },
        assignedCohorts: [
            {
                id: "1",
                name: "Data Science Bootcamp - Fall 2024",
                startDate: "2024-09-01",
                endDate: "2024-12-15",
                studentsCount: 25,
                maxCapacity: 30,
                status: "active",
                progress: 65,
                category: "Data Science",
                difficulty: "Intermediate",
            },
            {
                id: "2",
                name: "Advanced ML Techniques - Q4 2024",
                startDate: "2024-10-15",
                endDate: "2024-12-30",
                studentsCount: 20,
                maxCapacity: 25,
                status: "active",
                progress: 40,
                category: "Data Science",
                difficulty: "Advanced",
            },
        ],
        notes: [
            {
                id: "1",
                author: "John Smith",
                date: "2024-06-15",
                type: "performance",
                content: "Excellent mentor performance this quarter. Students consistently rate her sessions highly.",
            },
            {
                id: "2",
                author: "Sarah Wilson",
                date: "2024-05-20",
                type: "feedback",
                content: "Received positive feedback from students about her clear explanations and practical examples.",
            },
        ],
        communicationLogs: [
            {
                id: "1",
                type: "email",
                subject: "Weekly Progress Update",
                date: "2024-06-20",
                participants: ["Dr. Sarah Johnson", "John Smith"],
                summary: "Discussed student progress and upcoming curriculum changes.",
            },
            {
                id: "2",
                type: "meeting",
                subject: "Mentor Performance Review",
                date: "2024-06-15",
                participants: ["Dr. Sarah Johnson", "Sarah Wilson", "Mike Johnson"],
                summary: "Quarterly performance review - exceeded all targets.",
            },
        ],
    },
}

export default function MentorProfileView({ mentorId, onClose, onViewCohort }: MentorProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")
    const [newNote, setNewNote] = useState("")
    const [noteType, setNoteType] = useState("general")

    const mentor = mentorDetails[mentorId as keyof typeof mentorDetails]

    if (!mentor) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Mentor not found</p>
                <Button onClick={onClose} className="mt-4">
                    Go Back
                </Button>
            </div>
        )
    }

    const handleSaveNote = () => {
        // In a real app, this would save to the backend
        console.log("Saving note:", { type: noteType, content: newNote })
        setNewNote("")
        setNoteType("general")
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="text-2xl font-bold">Mentor Profile</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </Button>
                </div>
            </div>

            {/* Mentor Overview Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                            <AvatarFallback className="text-2xl">
                                {mentor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">{mentor.name}</h2>
                                <Badge variant={mentor.status === "active" ? "default" : "secondary"}>{mentor.status}</Badge>
                            </div>
                            <p className="text-lg text-muted-foreground mb-3">{mentor.specialization}</p>
                            <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{mentor.rating}</div>
                                    <div className="text-sm text-muted-foreground">Overall Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{mentor.totalStudents}</div>
                                    <div className="text-sm text-muted-foreground">Total Students</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{mentor.completedCohorts}</div>
                                    <div className="text-sm text-muted-foreground">Completed Cohorts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{mentor.performanceMetrics.completionRate}%</div>
                                    <div className="text-sm text-muted-foreground">Completion Rate</div>
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
                    <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
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
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{mentor.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{mentor.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Join Date</p>
                                        <p className="text-sm text-muted-foreground">{mentor.joinDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Experience</p>
                                        <p className="text-sm text-muted-foreground">{mentor.experience}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Student Satisfaction</span>
                                        <span>{mentor.performanceMetrics.studentSatisfaction}/5.0</span>
                                    </div>
                                    <Progress value={(mentor.performanceMetrics.studentSatisfaction / 5) * 100} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Session Attendance</span>
                                        <span>{mentor.performanceMetrics.sessionAttendance}%</span>
                                    </div>
                                    <Progress value={mentor.performanceMetrics.sessionAttendance} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Response Time</span>
                                        <span>{mentor.performanceMetrics.responseTime}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-green-600">{mentor.activeStudents}</div>
                                        <div className="text-xs text-muted-foreground">Active Students</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-blue-600">{mentor.activeCohorts}</div>
                                        <div className="text-xs text-muted-foreground">Active Cohorts</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Skills and Certifications */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Expertise</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Certifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mentor.certifications.slice(0, 3).map((cert, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Award className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <p className="font-medium text-sm">{cert.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {cert.issuer} • {cert.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Cohorts Tab */}
                <TabsContent value="cohorts" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Assigned Cohorts ({mentor.assignedCohorts.length})</h3>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign New Cohort
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mentor.assignedCohorts.map((cohort) => (
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
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="ml-1 font-medium">
                        {new Date(cohort.startDate).toLocaleDateString()} -{" "}
                                                {new Date(cohort.endDate).toLocaleDateString()}
                      </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => onViewCohort(cohort.id)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Students
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mentor.performanceMetrics.overallRating}</div>
                                <p className="text-xs text-muted-foreground">Out of 5.0</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mentor.performanceMetrics.completionRate}%</div>
                                <p className="text-xs text-muted-foreground">Student completion rate</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mentor.performanceMetrics.responseTime}</div>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trends</CardTitle>
                            <CardDescription>Monthly performance metrics over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    satisfaction: {
                                        label: "Satisfaction",
                                        color: "hsl(var(--chart-1))",
                                    },
                                    completion: {
                                        label: "Completion Rate",
                                        color: "hsl(var(--chart-2))",
                                    },
                                    engagement: {
                                        label: "Engagement",
                                        color: "hsl(var(--chart-3))",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mentor.performanceMetrics.monthlyProgress}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="satisfaction" stroke="var(--color-satisfaction)" strokeWidth={2} />
                                        <Line type="monotone" dataKey="completion" stroke="var(--color-completion)" strokeWidth={2} />
                                        <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Communication Tab */}
                <TabsContent value="communication" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Communication History</h3>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Communication
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Communications</CardTitle>
                            <CardDescription>All communications with and about this mentor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mentor.communicationLogs.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{log.type}</Badge>
                                                <h4 className="font-medium">{log.subject}</h4>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{log.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">Participants: {log.participants.join(", ")}</p>
                                        <p className="text-sm">{log.summary}</p>
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
                            <CardDescription>Add notes about mentor performance, feedback, or observations</CardDescription>
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
                                            <SelectItem value="feedback">Feedback</SelectItem>
                                            <SelectItem value="concern">Concern</SelectItem>
                                            <SelectItem value="achievement">Achievement</SelectItem>
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
                            <CardDescription>Historical notes and feedback about this mentor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mentor.notes.map((note) => (
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

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Education</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mentor.education.map((edu, index) => (
                                        <div key={index} className="border-l-2 border-primary pl-4">
                                            <h4 className="font-medium">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                            <p className="text-xs text-muted-foreground">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>All Certifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mentor.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">{cert.name}</h4>
                                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                                <p className="text-xs text-muted-foreground">Issued: {cert.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile Information</CardTitle>
                                <CardDescription>Update mentor profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-name">Full Name</Label>
                                        <Input id="edit-name" defaultValue={mentor.name} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input id="edit-email" type="email" defaultValue={mentor.email} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-phone">Phone</Label>
                                        <Input id="edit-phone" defaultValue={mentor.phone} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-specialization">Specialization</Label>
                                        <Input id="edit-specialization" defaultValue={mentor.specialization} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="edit-bio">Bio</Label>
                                    <Textarea id="edit-bio" defaultValue={mentor.bio} rows={4} />
                                </div>
                                <div className="flex gap-2">
                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
