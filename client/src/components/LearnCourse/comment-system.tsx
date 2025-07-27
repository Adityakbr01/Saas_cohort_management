"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MessageSquare, Pin, Reply, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"

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
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

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

  // Toggle expanded state for a comment or reply by ID
  const toggleExpanded = (id: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Enhanced role badge styling
  const getRoleBadgeClass = (role: string) => {
    let base =
      "rounded text-xs px-2 py-0.5 font-medium"
    if (role === "instructor" || role === "ta") {
      return `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white`
    }
    return `${base} bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-100`
  }

  // Enhanced timestamp styling
  const getTimestampClass = () =>
    "text-xs text-gray-500 dark:text-zinc-400"

  // Enhanced Show More/Less button styling
  const showMoreBtnClass = `
    mt-2 font-semibold text-base cursor-pointer transition-colors
    text-blue-600 hover:underline
    dark:text-blue-400 dark:hover:text-blue-300
  `

  // Enhanced comment/reply content rendering
  const renderContent = (content: string, id: string, size: "sm" | "xs") => {
    const expanded = expandedComments[id]
    const isLong = content.length > 200
    const displayText = expanded || !isLong ? content : content.slice(0, 200) + "..."
    const textSize = size === "sm" ? "text-sm" : "text-xs"

    return (
      <div>
        <p
          className={`
          ${textSize}
          whitespace-pre-wrap
          break-words break-all
          rounded
          px-2 py-1
          bg-white dark:bg-zinc-900
          text-gray-900 dark:text-gray-100
          shadow-sm
          border-0
        `}
          style={{ wordBreak: "break-word" }}
        >
          {displayText}
        </p>
        {isLong && (
          <button
            type="button"
            className={showMoreBtnClass}
            onClick={() => toggleExpanded(id)}
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    )
  }

  // Add a mock permission for demonstration (replace with your real logic)
  const isAdmin = true; // or use a prop/context/user check

  // Pin handler
  const handlePin = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned } : c
      )
    );
  };

  return (
    <div className="space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussion ({comments.length})
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Join the conversation about this lesson
              </CardDescription>
            </div>
            <div className="mt-2 sm:mt-0 flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="
    text-sm border rounded px-2 py-1
    bg-background text-primary border-primary
    focus:outline-none focus:ring-2 focus:ring-primary
    transition-colors
    dark:bg-background dark:text-primary dark:border-primary
  "
                style={{
                  colorScheme: "dark",
                }}
              >
                <option
                  className="text-primary bg-background"
                  value="newest"
                >
                  Newest First
                </option>
                <option
                  className="text-primary bg-background"
                  value="oldest"
                >
                  Oldest First
                </option>
                <option
                  className="text-primary bg-background"
                  value="popular"
                >
                  Most Popular
                </option>
              </select>
            </div>
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
                <div className="relative group" key={comment.id}>
                  {/* Pin icon on hover (top-right) */}
                  {isAdmin && (
                    <button
                      type="button"
                      aria-label={comment.isPinned ? "Unpin comment" : "Pin comment"}
                      title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                      onClick={() => handlePin(comment.id)}
                      className={`
                        absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 dark:bg-zinc-900/80
                        border border-gray-200 dark:border-zinc-700 shadow
                        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100
                        transition-opacity
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    >
                      <Pin
                        className={`h-5 w-5 ${comment.isPinned
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-zinc-500"
                          }`}
                        fill={comment.isPinned ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                  <Card
                    className="bg-blue-50 dark:bg-blue-900/60 rounded shadow-md border-0"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Avatar className="h-8 w-8 mx-auto sm:mx-0">
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback>
                            {comment.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm truncate">{comment.author.name}</span>
                            <span className={getRoleBadgeClass(comment.author.role)}>
                              {getRoleLabel(comment.author.role)}
                            </span>
                            <Pin className="h-3 w-3 text-blue-500" />
                            <span className={getTimestampClass()}>{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          {renderContent(comment.content, comment.id, "sm")}
                          <div className="flex flex-wrap items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Like"
                              className={cn(
                                "h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500",
                                comment.userReaction === "like" && "text-blue-600 bg-blue-50"
                              )}
                              onClick={() => handleReaction(comment.id, "like")}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Dislike"
                              className={cn(
                                "h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500",
                                comment.userReaction === "dislike" && "text-red-600 bg-red-50"
                              )}
                              onClick={() => handleReaction(comment.id, "dislike")}
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {comment.dislikes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Reply"
                              className="h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => setReplyingTo(comment.id)}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="ml-0 sm:ml-4 space-y-2 border-l-0 sm:border-l-2 border-muted pl-0 sm:pl-4">
                              {comment.replies.map((reply, idx) => (
                                <div
                                  key={reply.id}
                                  className={`
                                    flex flex-col sm:flex-row gap-2 rounded
                                    hover:bg-gray-100 dark:hover:bg-zinc-800
                                    transition-colors
                                    p-2
                                    shadow-sm
                                    ${idx === 0 ? "border border-gray-200 dark:border-zinc-700" : "border-0"}
                                  `}
                                >
                                  <Avatar className="h-6 w-6 mx-auto sm:mx-0">
                                    <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                                    <AvatarFallback className="text-xs">
                                      {reply.author.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-medium text-xs truncate">{reply.author.name}</span>
                                      <span className={getRoleBadgeClass(reply.author.role)}>
                                        {getRoleLabel(reply.author.role)}
                                      </span>
                                      <span className={getTimestampClass()}>{formatTimestamp(reply.timestamp)}</span>
                                    </div>
                                    {renderContent(reply.content, reply.id, "xs")}
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
                </div>
              ))}
            </div>
          )}

          {/* Regular Comments */}
          <div className="space-y-3">
            {regularComments.map((comment) => (
              <div className="relative group" key={comment.id}>
                {/* Pin icon on hover (top-right) */}
                {isAdmin && (
                  <button
                    type="button"
                    aria-label={comment.isPinned ? "Unpin comment" : "Pin comment"}
                    title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                    onClick={() => handlePin(comment.id)}
                    className={`
            absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 dark:bg-zinc-900/80
            border border-gray-200 dark:border-zinc-700 shadow
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100
            transition-opacity
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
                  >
                    <Pin
                      className={`h-5 w-5 ${comment.isPinned
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-zinc-500"
                        }`}
                      fill={comment.isPinned ? "currentColor" : "none"}
                    />
                  </button>
                )}
                <Card
                  className="bg-white dark:bg-zinc-900 rounded shadow-sm border-0"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Avatar className="h-8 w-8 mx-auto sm:mx-0">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback>
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm truncate">{comment.author.name}</span>
                          <span className={getRoleBadgeClass(comment.author.role)}>
                            {getRoleLabel(comment.author.role)}
                          </span>
                          <span className={getTimestampClass()}>{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        {renderContent(comment.content, comment.id, "sm")}
                        <div className="flex flex-wrap items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Like"
                            className={cn(
                              "h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500",
                              comment.userReaction === "like" && "text-blue-600 bg-blue-50"
                            )}
                            onClick={() => handleReaction(comment.id, "like")}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Dislike"
                            className={cn(
                              "h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500",
                              comment.userReaction === "dislike" && "text-red-600 bg-red-50"
                            )}
                            onClick={() => handleReaction(comment.id, "dislike")}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {comment.dislikes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Reply"
                            className="h-6 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-0 sm:ml-4 space-y-2 border-l-0 sm:border-l-2 border-muted pl-0 sm:pl-4">
                            {comment.replies.map((reply, idx) => (
                              <div
                                key={reply.id}
                                className={`
                                flex flex-col sm:flex-row gap-2 rounded
                                hover:bg-gray-100 dark:hover:bg-zinc-800
                                transition-colors
                                p-2
                                shadow-sm
                                ${idx === 0 ? "border border-gray-200 dark:border-zinc-700" : "border-0"}
                              `}
                              >
                                <Avatar className="h-6 w-6 mx-auto sm:mx-0">
                                  <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                                  <AvatarFallback className="text-xs">
                                    {reply.author.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-medium text-xs truncate">{reply.author.name}</span>
                                    <span className={getRoleBadgeClass(reply.author.role)}>
                                      {getRoleLabel(reply.author.role)}
                                    </span>
                                    <span className={getTimestampClass()}>{formatTimestamp(reply.timestamp)}</span>
                                  </div>
                                  {renderContent(reply.content, reply.id, "xs")}
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
              </div>
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
