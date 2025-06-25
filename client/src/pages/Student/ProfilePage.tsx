"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Award, Settings, User } from "lucide-react"
import { Link } from "react-router-dom"

// Mock user data
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  joinDate: "January 2023",
  avatar: "/placeholder.svg?height=100&width=100",
  bio: "Passionate learner and software developer with a focus on web technologies and data science.",
  enrolledCourses: [
    {
      id: "1",
      title: "Complete React Development Bootcamp",
      instructor: "Sarah Johnson",
      progress: 75,
      thumbnail: "/placeholder.svg?height=100&width=150",
      status: "In Progress",
      lastAccessed: "2 days ago",
    },
    {
      id: "2",
      title: "Python for Data Science",
      instructor: "Dr. Michael Chen",
      progress: 100,
      thumbnail: "/placeholder.svg?height=100&width=150",
      status: "Completed",
      lastAccessed: "1 week ago",
    },
    {
      id: "3",
      title: "UI/UX Design Fundamentals",
      instructor: "Emma Thompson",
      progress: 30,
      thumbnail: "/placeholder.svg?height=100&width=150",
      status: "In Progress",
      lastAccessed: "5 days ago",
    },
  ],
  certificates: [
    {
      id: "1",
      title: "Python for Data Science",
      issueDate: "March 2024",
      instructor: "Dr. Michael Chen",
    },
  ],
  stats: {
    coursesCompleted: 1,
    coursesInProgress: 2,
    totalHoursLearned: 45,
    certificatesEarned: 1,
  },
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
    bio: userData.bio,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // In a real app, this would save to an API
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback className="text-lg">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-1">{userData.name}</h2>
                  <p className="text-muted-foreground text-sm">{userData.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{userData.stats.coursesCompleted}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userData.stats.certificatesEarned}</div>
                      <div className="text-xs text-muted-foreground">Certificates</div>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t">
                    <div className="text-lg font-semibold">{userData.stats.totalHoursLearned} hours</div>
                    <div className="text-sm text-muted-foreground">Total Learning Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
                    <div className="space-y-4">
                      {userData.enrolledCourses.map((course) => (
                        <Card key={course.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <img src={course.thumbnail} alt={course.title} className="h-24 w-24 rounded-lg" />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold mb-1">{course.title}</h4>
                                    <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                                  </div>
                                  <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                                    {course.status}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                  <p className="text-xs text-muted-foreground">Last accessed {course.lastAccessed}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button size="sm" asChild>
                                    <Link to={`/courses/${course.id}`}>
                                      {course.status === "Completed" ? "Review" : "Continue"}
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    View Certificate
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">My Certificates</h3>
                    {userData.certificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userData.certificates.map((cert) => (
                          <Card key={cert.id} className="border-2 border-primary/20">
                            <CardContent className="p-6 text-center">
                              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                              <h4 className="font-semibold mb-2">{cert.title}</h4>
                              <p className="text-sm text-muted-foreground mb-1">Instructor: {cert.instructor}</p>
                              <p className="text-sm text-muted-foreground mb-4">Issued: {cert.issueDate}</p>
                              <Button size="sm" variant="outline">
                                Download Certificate
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-semibold mb-2">No Certificates Yet</h4>
                          <p className="text-muted-foreground mb-4">
                            Complete courses to earn certificates and showcase your achievements.
                          </p>
                          <Button asChild>
                            <Link to="/courses">Browse Courses</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        >
                          {isEditing ? "Save Changes" : "Edit Profile"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button>Update Password</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
