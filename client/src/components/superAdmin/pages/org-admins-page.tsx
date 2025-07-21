"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, UserCheck, UserX, Mail, Phone, Search, UserPlus } from "lucide-react"

const orgAdmins = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@techcorp.com",
    phone: "+1 (555) 123-4567",
    organization: "TechCorp Solutions",
    status: "active",
    joinDate: "2023-01-15",
    lastLogin: "2024-01-10",
    mentors: [
      { id: 1, name: "Dr. Sarah Wilson", subject: "Data Science", students: 45 },
      { id: 2, name: "Mark Thompson", subject: "Web Development", students: 32 },
      { id: 3, name: "Lisa Chen", subject: "UI/UX Design", students: 28 },
    ],
  },
  {
    id: 2,
    name: "Robert Martinez",
    email: "robert@innovate.edu",
    phone: "+1 (555) 987-6543",
    organization: "Innovate Education",
    status: "active",
    joinDate: "2023-03-22",
    lastLogin: "2024-01-09",
    mentors: [
      { id: 4, name: "Prof. James Brown", subject: "Mathematics", students: 67 },
      { id: 5, name: "Emily Davis", subject: "Physics", students: 41 },
    ],
  },
  {
    id: 3,
    name: "Jennifer Lee",
    email: "jennifer@globallearn.org",
    phone: "+1 (555) 456-7890",
    organization: "Global Learning Institute",
    status: "suspended",
    joinDate: "2022-11-08",
    lastLogin: "2024-01-05",
    mentors: [
      { id: 6, name: "Dr. Michael Chang", subject: "Computer Science", students: 89 },
      { id: 7, name: "Anna Rodriguez", subject: "Digital Marketing", students: 34 },
      { id: 8, name: "Tom Wilson", subject: "Business Analytics", students: 52 },
      { id: 9, name: "Kate Johnson", subject: "Project Management", students: 23 },
    ],
  },
]

export default function OrgAdminsPage() {
  const [admins, setAdmins] = useState(orgAdmins)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSuspendAdmin = (adminId: number) => {
    setAdmins(
      admins.map((admin) =>
        admin.id === adminId ? { ...admin, status: admin.status === "active" ? "suspended" : "active" } : admin,
      ),
    )
  }

  const handleDeleteAdmin = (adminId: number) => {
    setAdmins(admins.filter((admin) => admin.id !== adminId))
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Administrators</h2>
          <p className="text-muted-foreground">
            Manage organization administrators and their associated mentors/teachers.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search administrators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">Organization administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.filter((a) => a.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.reduce((sum, admin) => sum + admin.mentors.length, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.reduce(
                (sum, admin) => sum + admin.mentors.reduce((mentorSum, mentor) => mentorSum + mentor.students, 0),
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Being mentored</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback>
                      {admin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{admin.name}</CardTitle>
                    <CardDescription className="text-base">{admin.organization}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={admin.status === "active" ? "default" : "destructive"}>{admin.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSuspendAdmin(admin.id)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        {admin.status === "active" ? "Suspend" : "Activate"}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <UserX className="mr-2 h-4 w-4" />
                            <span className="text-red-600">Delete Account</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete {admin.name}'s account and
                              remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{admin.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{admin.phone}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined: {new Date(admin.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Associated Mentors ({admin.mentors.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {admin.mentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <div className="font-medium">{mentor.name}</div>
                          <div className="text-xs text-muted-foreground">{mentor.subject}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mentor.students} students
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
