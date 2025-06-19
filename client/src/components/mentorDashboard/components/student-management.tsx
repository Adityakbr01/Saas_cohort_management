"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertCircle,
  Search,
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  Award,
  Clock,
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

interface StudentManagementProps {
  onViewCohort: (cohortId: string) => void
  onViewStudent: (studentId: string) => void
}

// Mock data for cohorts and students
const cohortsData = [
  {
    id: "cohort_1",
    name: "Data Science Bootcamp - Fall 2024",
    subject: "Data Science",
    startDate: "2024-09-01",
    endDate: "2024-12-15",
    studentsCount: 25,
    maxCapacity: 30,
    status: "active",
    progress: 65,
    completionRate: 92,
    averageGrade: "B+",
    atRiskStudents: 3,
  },
  {
    id: "cohort_2",
    name: "Machine Learning Advanced - Q4 2024",
    subject: "Machine Learning",
    startDate: "2024-10-15",
    endDate: "2024-12-30",
    studentsCount: 15,
    maxCapacity: 20,
    status: "active",
    progress: 40,
    completionRate: 88,
    averageGrade: "A-",
    atRiskStudents: 1,
  },
  {
    id: "cohort_3",
    name: "Python Fundamentals - Summer 2024",
    subject: "Programming",
    startDate: "2024-06-01",
    endDate: "2024-08-15",
    studentsCount: 20,
    maxCapacity: 25,
    status: "completed",
    progress: 100,
    completionRate: 95,
    averageGrade: "A",
    atRiskStudents: 0,
  },
]

const allStudentsData = [
  {
    id: "s1",
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    cohort: "Data Science Bootcamp - Fall 2024",
    cohortId: "cohort_1",
    progress: 78,
    grade: "A-",
    status: "active",
    lastActive: "2 hours ago",
    joinDate: "2024-09-01",
    attendanceRate: 95,
    assignments: { completed: 9, total: 12 },
  },
  {
    id: "s2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    cohort: "Data Science Bootcamp - Fall 2024",
    cohortId: "cohort_1",
    progress: 85,
    grade: "A",
    status: "active",
    lastActive: "1 day ago",
    joinDate: "2024-09-01",
    attendanceRate: 100,
    assignments: { completed: 10, total: 12 },
  },
  {
    id: "s3",
    name: "Bob Wilson",
    email: "bob.wilson@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    cohort: "Data Science Bootcamp - Fall 2024",
    cohortId: "cohort_1",
    progress: 45,
    grade: "C",
    status: "at-risk",
    lastActive: "3 days ago",
    joinDate: "2024-09-01",
    attendanceRate: 70,
    assignments: { completed: 5, total: 12 },
  },
  {
    id: "s4",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    cohort: "Machine Learning Advanced - Q4 2024",
    cohortId: "cohort_2",
    progress: 92,
    grade: "A+",
    status: "active",
    lastActive: "1 hour ago",
    joinDate: "2024-10-15",
    attendanceRate: 100,
    assignments: { completed: 8, total: 8 },
  },
]

export default function StudentManagement({ onViewCohort, onViewStudent }: StudentManagementProps) {
  const [activeView, setActiveView] = useState<"cohorts" | "students">("cohorts")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cohortFilter, setCohortFilter] = useState("all")

  const filteredStudents = allStudentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesCohort = cohortFilter === "all" || student.cohortId === cohortFilter
    return matchesSearch && matchesStatus && matchesCohort
  })

  const filteredCohorts = cohortsData.filter((cohort) => {
    const matchesSearch = cohort.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cohort.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeView === "cohorts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("cohorts")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Cohorts View
            </Button>
            <Button
              variant={activeView === "students" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("students")}
            >
              <Users className="h-4 w-4 mr-2" />
              Students View
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          {activeView === "students" && (
            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Filter by cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {cohortsData.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Cohorts View */}
      {activeView === "cohorts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCohorts.map((cohort) => (
            <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <CardDescription>{cohort.subject}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      cohort.status === "active" ? "default" : cohort.status === "completed" ? "secondary" : "outline"
                    }
                  >
                    {cohort.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {cohort.studentsCount}/{cohort.maxCapacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{cohort.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{cohort.averageGrade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{cohort.atRiskStudents} at risk</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{cohort.progress}%</span>
                  </div>
                  <Progress value={cohort.progress} className="h-2" />
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
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
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Students View */}
      {activeView === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
            <CardDescription>Manage and monitor all students across your cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
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
                      <Button
                        variant="link"
                        className="p-0 h-auto text-left"
                        onClick={() => onViewCohort(student.cohortId)}
                      >
                        {student.cohort}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{student.progress}%</span>
                          <span className="text-muted-foreground">
                            {student.assignments.completed}/{student.assignments.total}
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
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {student.lastActive}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewCohort(student.cohortId)}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Cohort
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Remove Student</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allStudentsData.length}</div>
            <p className="text-xs text-muted-foreground">
              {allStudentsData.filter((s) => s.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohortsData.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {cohortsData.filter((c) => c.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {allStudentsData.filter((s) => s.status === "at-risk").length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(cohortsData.reduce((acc, c) => acc + c.completionRate, 0) / cohortsData.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all cohorts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
