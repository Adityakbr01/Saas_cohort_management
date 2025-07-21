"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, Pin, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    role: "student" | "instructor" | "ta"
  }
  content: string
  timestamp: string
  likes: number
  dislikes: number
  isPinned: boolean
  replies: Comment[]
  userReaction?: "like" | "dislike" | null
}

interface CommentSystemProps {
  lessonId: string
}

export default function CommentSystem({ lessonId }: CommentSystemProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest")

  console.log(lessonId)

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "instructor",
      },
      content:
        "Great question about React hooks! Remember that hooks can only be called at the top level of your React function components. This is crucial for maintaining the order of hook calls between renders.",
      timestamp: "2024-01-15T10:30:00Z",
      likes: 12,
      dislikes: 0,
      isPinned: true,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Alex Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            role: "student",
          },
          content: "Thanks for the clarification! This really helps understand the rules of hooks.",
          timestamp: "2024-01-15T11:00:00Z",
          likes: 3,
          dislikes: 0,
          isPinned: false,
          replies: [],
        },
      ],
    },
    {
      id: "2",
      author: {
        name: "Mike Rodriguez",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "student",
      },
      content:
        "I'm having trouble understanding the difference between useState and useReducer. When should I use each one?",
      timestamp: "2024-01-15T09:15:00Z",
      likes: 8,
      dislikes: 1,
      isPinned: false,
      replies: [
        {
          id: "2-1",
          author: {
            name: "Emma Wilson",
            avatar: "/placeholder.svg?height=32&width=32",
            role: "ta",
          },
          content:
            "Great question! Use useState for simple state values and useReducer for complex state logic with multiple sub-values or when the next state depends on the previous one.",
          timestamp: "2024-01-15T09:45:00Z",
          likes: 5,
          dislikes: 0,
          isPinned: false,
          replies: [],
        },
      ],
    },
    {
      id: "3",
      author: {
        name: "Lisa Park",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "student",
      },
      content:
        "The video quality is excellent and the explanations are very clear. Thank you for this comprehensive tutorial!",
      timestamp: "2024-01-15T08:30:00Z",
      likes: 15,
      dislikes: 0,
      isPinned: false,
      replies: [],
    },
  ])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "ta":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "instructor":
        return "Instructor"
      case "ta":
        return "TA"
      default:
        return "Student"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleReaction = (commentId: string, reaction: "like" | "dislike") => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const currentReaction = comment.userReaction
          let newLikes = comment.likes
          let newDislikes = comment.dislikes
          let newReaction: "like" | "dislike" | null = reaction

          // Remove previous reaction
          if (currentReaction === "like") newLikes--
          if (currentReaction === "dislike") newDislikes--

          // Add new reaction if different from current
          if (currentReaction === reaction) {
            newReaction = null
          } else {
            if (reaction === "like") newLikes++
            if (reaction === "dislike") newDislikes++
          }

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes,
            userReaction: newReaction,
          }
        }
        return comment
      }),
    )
  }

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "student",
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isPinned: false,
      replies: [],
    }

    setComments((prev) => [comment, ...prev])
    setNewComment("")
  }

  const addReply = (parentId: string) => {
    if (!replyText.trim()) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "student",
      },
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isPinned: false,
      replies: [],
    }

    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply],
          }
        }
        return comment
      }),
    )

    setReplyText("")
    setReplyingTo(null)
  }

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case "popular":
        return b.likes - b.dislikes - (a.likes - a.dislikes)
      default: // newest
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  const pinnedComments = sortedComments.filter((c) => c.isPinned)
  const regularComments = sortedComments.filter((c) => !c.isPinned)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussion ({comments.length})
              </CardTitle>
              <CardDescription>Join the conversation about this lesson</CardDescription>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Comment Form */}
          <div className="space-y-2">
            <Textarea
              placeholder="Ask a question or share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button onClick={addComment} disabled={!newComment.trim()}>
                <Send className="h-3 w-3 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Pinned Comments */}
          {pinnedComments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pin className="h-3 w-3" />
                Pinned Comments
              </h4>
              {pinnedComments.map((comment) => (
                <Card key={comment.id} className="bg-blue-50/50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback>
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <Badge variant="outline" className={getRoleColor(comment.author.role)}>
                            {getRoleLabel(comment.author.role)}
                          </Badge>
                          <Pin className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              comment.userReaction === "like" && "text-blue-600 bg-blue-50",
                            )}
                            onClick={() => handleReaction(comment.id, "like")}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              comment.userReaction === "dislike" && "text-red-600 bg-red-50",
                            )}
                            onClick={() => handleReaction(comment.id, "dislike")}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {comment.dislikes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={reply.author.avatar || "/placeholder.svg"}
                                    alt={reply.author.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {reply.author.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">{reply.author.name}</span>
                                    <Badge variant="outline" className={`text-xs ${getRoleColor(reply.author.role)}`}>
                                      {getRoleLabel(reply.author.role)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimestamp(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="ml-4 space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => addReply(comment.id)}>
                                Reply
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Regular Comments */}
          <div className="space-y-3">
            {regularComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                      <AvatarFallback>
                        {comment.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <Badge variant="outline" className={getRoleColor(comment.author.role)}>
                          {getRoleLabel(comment.author.role)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs",
                            comment.userReaction === "like" && "text-blue-600 bg-blue-50",
                          )}
                          onClick={() => handleReaction(comment.id, "like")}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs",
                            comment.userReaction === "dislike" && "text-red-600 bg-red-50",
                          )}
                          onClick={() => handleReaction(comment.id, "dislike")}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          {comment.dislikes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                                <AvatarFallback className="text-xs">
                                  {reply.author.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.author.name}</span>
                                  <Badge variant="outline" className={`text-xs ${getRoleColor(reply.author.role)}`}>
                                    {getRoleLabel(reply.author.role)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="ml-4 space-y-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => addReply(comment.id)}>
                              Reply
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs">Be the first to start the discussion!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
