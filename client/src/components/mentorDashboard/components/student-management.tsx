

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Clock,
  BadgeCheck,
  XCircle,
  Trash2,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCohortMutation, useUpdateCohortMutation } from "@/store/features/api/cohorts/cohorts.api";
import { UpdateCohortDialog } from "./UpdateCohortDialog";
// Cohort interface based on API response
interface Cohort {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  mentor: {
    _id: string;
    name: string;
    specialization: string;
    overallRating: number;
    responseTime: string;
  };
  organization: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  maxCapacity: number;
  status: string;
  category: string;
  difficulty: string;
  students: string[];
  schedule: string;
  location: string;
  progress: number;
  completionRate: number;
  language: string;
  tags: string[];
  prerequisites: string[];
  certificateAvailable: boolean;
  Thumbnail: string;
  demoVideo: string;
  createdAt: string;
}

interface StudentManagementProps {
  cohorts: Cohort[];
  onViewCohort: (cohortId: string) => void;
  onViewStudent: (studentId: string) => void;
}


// Mock student data (since API response doesn't provide student data)
const allStudentsData = [
  {
    id: "s1",
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    cohort: "Data Science Bootcamp - Fall 2024",
    cohortId: "6865084562109e01ff761507", // Matches API cohort _id
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
    cohortId: "6865084562109e01ff761507",
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
    cohortId: "6865084562109e01ff761507",
    progress: 45,
    grade: "C",
    status: "at-risk",
    lastActive: "3 days ago",
    joinDate: "2024-09-01",
    attendanceRate: 70,
    assignments: { completed: 5, total: 12 },
  },
];

function StudentManagement({ cohorts, onViewCohort, onViewStudent }: StudentManagementProps) {
  const [activeView, setActiveView] = useState<"cohorts" | "students">("cohorts");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cohortFilter, setCohortFilter] = useState("all");

  const [updateCohort] = useUpdateCohortMutation()
  const [deleteCohort] = useDeleteCohortMutation()

  const filteredStudents = allStudentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesCohort = cohortFilter === "all" || student.cohortId === cohortFilter;
    return matchesSearch && matchesStatus && matchesCohort;
  });

  const filteredCohorts = cohorts.filter((cohort) => {
    const matchesSearch = cohort.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cohort.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCohort = async (cohortId: string) => {
    try {
      await deleteCohort(cohortId).unwrap();
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete cohort:", err);
    }
  };



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
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort._id} value={cohort._id}>
                    {cohort.title}
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
          {filteredCohorts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No cohorts found
              </CardContent>
            </Card>
          ) : (
            filteredCohorts.map((cohort) => (
              <Card key={cohort._id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cohort.title}</CardTitle>
                      <CardDescription>{cohort.category}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        cohort.status === "active"
                          ? "default"
                          : cohort.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>
                        {cohort.students.length}/{cohort.maxCapacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      <span>{cohort.progress}%</span>
                    </div>                   <div className="flex items-center gap-2">
                      {(cohort.certificateAvailable) ? (
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{cohort.certificateAvailable ? "YES" : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span>
                        {
                          allStudentsData.filter(
                            (s) => s.cohortId === cohort._id && s.status === "at-risk"
                          ).length
                        } at risk
                      </span>
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
                    <Button size="sm" onClick={() => onViewCohort(cohort._id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <UpdateCohortDialog
                      cohort={cohort}
                      onUpdate={(updatedData) => updateCohort({ id: cohort._id, data: updatedData })}
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCohort(cohort._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
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
                  ))
                )}
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
            <div className="text-2xl font-bold">{cohorts.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {cohorts.filter((c) => c.status === "completed").length} completed
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
              {cohorts.length
                ? Math.round(cohorts.reduce((acc, c) => acc + c.completionRate, 0) / cohorts.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all cohorts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StudentManagement;
