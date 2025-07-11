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
import {
  ArrowLeft,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Download,
  Upload,
  Search,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetCohortByIdQuery } from "@/store/features/api/cohorts/cohorts.api"

interface CohortManagementProps {
  cohortId: string
  onBack: () => void
  onViewStudent: (studentId: string) => void
  onEditCurriculum: () => void
}

interface Student {
  _id: string
  name: string
  email: string
  status: string
  progress: number
  lastActive: string
  avatar: string
  assignments: { completed: number; total: number }
  grade: string
  attendanceRate: number
}

export default function CohortManagement({ cohortId, onBack, onViewStudent, onEditCurriculum }: CohortManagementProps) {
  const { data, isLoading, error } = useGetCohortByIdQuery(cohortId, {
    skip: !cohortId,
  })


  const cohortData = data?.data || {
    _id: "",
    title: "Loading...",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
    maxCapacity: 0,
    students: [] as Student[],
    progress: 0,
    completionRate: 0,
    schedule: "",
    location: "",
    assignments: [],
    communications: [],
  }

  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [studentFilter, setStudentFilter] = useState("all")
  const [isEditingCohort, setIsEditingCohort] = useState(false)

  const filteredStudents = cohortData.students.filter((student:Student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = studentFilter === "all" || student.status === studentFilter
    return matchesSearch && matchesFilter
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading cohort data</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold">{cohortData.title}</h1>
              <p className="text-muted-foreground">{cohortData.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEditCurriculum}>
              <BookOpen className="h-4 w-4 mr-2" />
              Edit Curriculum
            </Button>
            <Button variant="outline" onClick={() => setIsEditingCohort(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Cohort Settings
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Student List (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Progress Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Attendance Report (Excel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cohort Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cohortData.students.length}/{cohortData.maxCapacity}
              </div>
              marked out of necessity
              <Progress value={(cohortData.students.length / cohortData.maxCapacity) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cohortData.progress}%</div>
              <Progress value={cohortData.progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cohortData.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {cohortData.students.filter((s:Student) => s.status === "at-risk").length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Schedule</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.schedule}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cohortData.startDate).toLocaleDateString()} -{" "}
                      {new Date(cohortData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={cohortData.status === "active" ? "default" : "secondary"} className="ml-2">
                      {cohortData.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.difficulty}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Language</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.language}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mentor</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.mentor?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Certificate Available</Label>
                    <p className="text-sm text-muted-foreground">{cohortData.certificateAvailable ? "Yes" : "No"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Materials
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
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
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Student to Cohort</DialogTitle>
                    <DialogDescription>Add an existing student or create a new student profile.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Add Existing Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Search and select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student1">Alice Johnson - alice@email.com</SelectItem>
                          <SelectItem value="student2">Mike Brown - mike@email.com</SelectItem>
                          <SelectItem value="student3">Sarah Davis - sarah@email.com</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">or</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Create New Student</Label>
                        <Input placeholder="Full Name" />
                      </div>
                      <div className="space-y-2">
                        <Label> </Label>
                        <Input placeholder="Email Address" type="email" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Add Student</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {cohortData.students.length === 0 ? (
                  <p className="text-center text-muted-foreground">No students enrolled in this cohort.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student:Student) => (
                        <TableRow key={student._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                <AvatarFallback>
                                  {student.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{student.progress}%</span>
                                <span className="text-muted-foreground">
                                  {student.assignments?.completed}/{student.assignments?.total}
                                </span>
                              </div>
                              <Progress value={student.progress} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.grade}</Badge>
                          </TableCell>
                          <TableCell>{student.attendanceRate}%</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "default"
                                  : student.status === "at-risk"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.lastActive}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onViewStudent(student._id)}>
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove from Cohort
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assignments & Assessments</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>Create a new assignment or assessment for your students.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Assignment Title</Label>
                      <Input placeholder="Enter assignment title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Enter assignment description and requirements" rows={4} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Create Assignment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {cohortData?.assignments?.length === 0 ? (
                  <p className="text-center text-muted-foreground">No assignments available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    { cohortData?.assignments && cohortData?.assignments.map((assignment:{id:string;title:string;status:string;dueDate:string;submissions:number;averageScore:number;}) => (
                      <Card key={assignment.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <Badge
                              variant={
                                assignment.status === "completed"
                                  ? "default"
                                  : assignment.status === "active"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {assignment.status}
                            </Badge>
                          </div>
                          <CardDescription>Due: {new Date(assignment.dueDate).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Submissions</span>
                              <span>
                                {assignment.submissions}/{cohortData?.students?.length}
                              </span>
                            </div>
                            <Progress value={(assignment.submissions / cohortData?.students?.length) * 100} className="h-2" />
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{assignment.averageScore}</div>
                            <div className="text-sm text-muted-foreground">Average Score</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication History</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>Send an announcement to your cohort students.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input placeholder="Enter announcement subject" />
                    </div>
                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="active">Active Students Only</SelectItem>
                          <SelectItem value="at-risk">At-Risk Students Only</SelectItem>
                          <SelectItem value="custom">Custom Selection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea placeholder="Enter your announcement message" rows={6} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Send Announcement</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {cohortData?.communications?.length === 0 ? (
                  <p className="text-center text-muted-foreground">No communications available.</p>
                ) : (
                  <div className="space-y-4">
                    {cohortData?.communications?.map((comm:{id:string;type:string;subject:string;date:string;author:string;recipients:string;content:string;}) => (
                      <div key={comm.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{comm.type}</Badge>
                            <h4 className="font-medium">{comm.subject}</h4>
                          </div>
                          <span className="text-sm text-muted-foreground">{comm.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          From: {comm.author} • To: {comm.recipients}
                        </p>
                        <p className="text-sm">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Engagement</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">Data not available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignment Completion</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cohortData.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">Above target</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Satisfaction</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">Data not available</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Performance Trends</CardTitle>
                <CardDescription>Track student progress and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <p className="text-center text-muted-foreground mt-20">
                    Analytics chart would be displayed here showing cohort performance trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Cohort Dialog */}
        <Dialog open={isEditingCohort} onOpenChange={setIsEditingCohort}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Cohort Settings</DialogTitle>
              <DialogDescription>Update cohort information and settings.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Cohort Name</Label>
                <Input defaultValue={cohortData.title} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={cohortData.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" defaultValue={cohortData.startDate.split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" defaultValue={cohortData.endDate.split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input type="number" defaultValue={cohortData.maxCapacity} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={cohortData.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Schedule</Label>
                <Input defaultValue={cohortData.schedule} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Location</Label>
                <Input defaultValue={cohortData.location} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Category</Label>
                <Input defaultValue={cohortData.category} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Difficulty</Label>
                <Select defaultValue={cohortData.difficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Language</Label>
                <Input defaultValue={cohortData.language} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingCohort(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditingCohort(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}