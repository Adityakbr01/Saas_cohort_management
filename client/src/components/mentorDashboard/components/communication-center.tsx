"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Search,
  Plus,
  Bell,
  Users,
  Megaphone,
  Clock,
  Eye,
  Reply,
  Forward,
  Archive,
  Star,
  Filter,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface CommunicationCenterProps {
  onBack: () => void
}

// Mock data for communication center
const messagesData = [
  {
    id: "msg_1",
    type: "direct",
    from: {
      id: "s1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
    },
    to: "mentor",
    subject: "Question about ML assignment",
    content:
      "Hi Dr. Johnson, I'm having trouble with the feature selection part of the ML assignment. Could you provide some guidance on which techniques work best for this type of dataset?",
    timestamp: "2024-06-20T14:30:00Z",
    status: "unread",
    priority: "medium",
    cohort: "Data Science Bootcamp",
    hasAttachment: false,
    isStarred: false,
  },
  {
    id: "msg_2",
    type: "direct",
    from: {
      id: "s2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
    },
    to: "mentor",
    subject: "Thank you for the feedback",
    content:
      "Thank you for the detailed feedback on my data visualization project. The suggestions really helped me improve my charts. I've implemented the changes and would love to show you the updated version.",
    timestamp: "2024-06-20T10:15:00Z",
    status: "read",
    priority: "low",
    cohort: "Data Science Bootcamp",
    hasAttachment: true,
    isStarred: true,
  },
  {
    id: "msg_3",
    type: "direct",
    from: {
      id: "s3",
      name: "Bob Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
    },
    to: "mentor",
    subject: "Request for office hours",
    content:
      "Hi, I'm struggling with the statistics module and would really benefit from some one-on-one time. Are you available for office hours this week? I'm flexible with timing.",
    timestamp: "2024-06-19T16:45:00Z",
    status: "read",
    priority: "high",
    cohort: "Data Science Bootcamp",
    hasAttachment: false,
    isStarred: false,
  },
]

const announcementsData = [
  {
    id: "ann_1",
    title: "Week 7 Materials Now Available",
    content:
      "The materials for Week 7 covering Advanced Machine Learning techniques are now available in the course portal. Please review the pre-reading materials before our next session.",
    author: "Dr. Sarah Johnson",
    timestamp: "2024-06-20T09:00:00Z",
    recipients: "All Students",
    cohorts: ["Data Science Bootcamp", "ML Advanced"],
    status: "sent",
    views: 23,
    responses: 5,
  },
  {
    id: "ann_2",
    title: "Upcoming Project Deadline Reminder",
    content:
      "This is a friendly reminder that the Machine Learning project is due next Friday, June 28th. Please make sure to submit your work through the course portal by 11:59 PM EST.",
    author: "Dr. Sarah Johnson",
    timestamp: "2024-06-19T15:30:00Z",
    recipients: "Data Science Bootcamp Students",
    cohorts: ["Data Science Bootcamp"],
    status: "sent",
    views: 25,
    responses: 2,
  },
]

const discussionsData = [
  {
    id: "disc_1",
    title: "Best practices for data preprocessing",
    author: {
      id: "s4",
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
    },
    content:
      "I've been experimenting with different data preprocessing techniques and wanted to share some insights. What methods have you found most effective for handling missing data?",
    timestamp: "2024-06-20T11:20:00Z",
    cohort: "Data Science Bootcamp",
    replies: 8,
    likes: 12,
    isActive: true,
    lastActivity: "2024-06-20T13:45:00Z",
  },
  {
    id: "disc_2",
    title: "Career advice for transitioning to data science",
    author: {
      id: "s5",
      name: "Mike Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "student",
    },
    content:
      "For those who have successfully transitioned to data science roles, what advice would you give to someone just starting their journey? Any specific skills or projects that helped you stand out?",
    timestamp: "2024-06-19T14:10:00Z",
    cohort: "Data Science Bootcamp",
    replies: 15,
    likes: 20,
    isActive: true,
    lastActivity: "2024-06-20T09:30:00Z",
  },
]

export default function CommunicationCenter({ onBack }: CommunicationCenterProps) {
  const [activeTab, setActiveTab] = useState("messages")
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [messageFilter, setMessageFilter] = useState("all")
  const [isComposingMessage, setIsComposingMessage] = useState(false)
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)

  const filteredMessages = messagesData.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      messageFilter === "all" ||
      (messageFilter === "unread" && message.status === "unread") ||
      (messageFilter === "starred" && message.isStarred) ||
      (messageFilter === "priority" && message.priority === "high")

    return matchesSearch && matchesFilter
  })

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    )
  }

  const handleSelectAllMessages = () => {
    setSelectedMessages(
      selectedMessages.length === filteredMessages.length ? [] : filteredMessages.map((msg) => msg.id),
    )
  }

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "default"
      case "read":
        return "secondary"
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
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
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold">Communication Center</h1>
              <p className="text-muted-foreground">Manage messages, announcements, and discussions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Dialog open={isComposingMessage} onOpenChange={setIsComposingMessage}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                  <DialogDescription>Send a message to students or create an announcement.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Message Type</Label>
                      <Select defaultValue="direct">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct Message</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="cohort1">Data Science Bootcamp</SelectItem>
                          <SelectItem value="cohort2">ML Advanced</SelectItem>
                          <SelectItem value="individual">Individual Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Enter message subject" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea placeholder="Enter your message" rows={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select defaultValue="medium">
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsComposingMessage(false)}>
                    Save Draft
                  </Button>
                  <Button onClick={() => setIsComposingMessage(false)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messagesData.filter((m) => m.status === "unread").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{discussionsData.filter((d) => d.isActive).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements Sent</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcementsData.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Within 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={messageFilter} onValueChange={setMessageFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="starred">Starred</SelectItem>
                    <SelectItem value="priority">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedMessages.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive ({selectedMessages.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </Button>
                </div>
              )}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  {/* Select All Header */}
                  <div className="flex items-center gap-3 p-3 border-b">
                    <Checkbox
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onCheckedChange={handleSelectAllMessages}
                    />
                    <span className="text-sm font-medium">
                      {selectedMessages.length > 0 ? `${selectedMessages.length} selected` : "Select all"}
                    </span>
                  </div>

                  {/* Messages List */}
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${
                        message.status === "unread" ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={() => handleSelectMessage(message.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.from.avatar || "/placeholder.svg"} alt={message.from.name} />
                        <AvatarFallback>
                          {message.from.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium truncate ${message.status === "unread" ? "font-bold" : ""}`}>
                              {message.from.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {message.cohort}
                            </Badge>
                            {message.priority !== "low" && (
                              <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                                {message.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {message.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                          </div>
                        </div>
                        <p
                          className={`text-sm truncate ${message.status === "unread" ? "font-medium" : "text-muted-foreground"}`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <Dialog open={isCreatingAnnouncement} onOpenChange={setIsCreatingAnnouncement}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>Send an announcement to your students.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input placeholder="Enter announcement title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="cohort1">Data Science Bootcamp</SelectItem>
                          <SelectItem value="cohort2">ML Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea placeholder="Enter announcement content" rows={6} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="schedule" />
                      <Label htmlFor="schedule">Schedule for later</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingAnnouncement(false)}>
                      Save Draft
                    </Button>
                    <Button onClick={() => setIsCreatingAnnouncement(false)}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Announcement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {announcementsData.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <CardDescription>
                          By {announcement.author} • {formatTimestamp(announcement.timestamp)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{announcement.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{announcement.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{announcement.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{announcement.responses} responses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{announcement.recipients}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Reply className="h-4 w-4 mr-2" />
                          Responses
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Class Discussions</h3>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter Discussions
              </Button>
            </div>

            <div className="space-y-4">
              {discussionsData.map((discussion) => (
                <Card key={discussion.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage
                          src={discussion.author.avatar || "/placeholder.svg"}
                          alt={discussion.author.name}
                        />
                        <AvatarFallback>
                          {discussion.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{discussion.title}</CardTitle>
                            <CardDescription>
                              By {discussion.author.name} • {formatTimestamp(discussion.timestamp)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{discussion.cohort}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{discussion.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{discussion.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Last activity: {formatTimestamp(discussion.lastActivity)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Discussion
                        </Button>
                        <Button variant="outline" size="sm">
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2h</div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">Active in discussions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Message Volume</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">Messages this week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Communication Trends</CardTitle>
                <CardDescription>Track communication patterns and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <p className="text-center text-muted-foreground mt-20">
                    Communication analytics chart would be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Detail Modal */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedMessage.subject}</DialogTitle>
                  <DialogDescription>
                    From {selectedMessage.from.name} • {formatTimestamp(selectedMessage.timestamp)}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage
                        src={selectedMessage.from.avatar || "/placeholder.svg"}
                        alt={selectedMessage.from.name}
                      />
                      <AvatarFallback>
                        {selectedMessage.from.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedMessage.from.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.cohort}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Badge variant={getPriorityColor(selectedMessage.priority)}>{selectedMessage.priority}</Badge>
                      <Badge variant={getMessageStatusColor(selectedMessage.status)}>{selectedMessage.status}</Badge>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{selectedMessage.content}</p>
                  </div>
                  <div className="mt-4">
                    <Label>Reply</Label>
                    <Textarea placeholder="Type your reply..." rows={4} className="mt-2" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
