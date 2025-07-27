import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, MessageSquare, Pencil, Pin, Reply, Send, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { Role } from "@/config/constant";
import { cn } from "@/lib/utils";
import {
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
  useEditCommentMutation,
  useGetCommentsQuery,
  useToggleDislikeMutation,
  useToggleLikeMutation,
  useTogglePinMutation,
} from "@/store/features/api/comments/comment.api";
import { selectCurrentUser } from "@/store/features/slice/UserAuthSlice";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
    role: "student" | "mentor" | "organization";
  };
  content: string;
  createdAt: string;
  likes?: string[];
  dislikes?: string[];
  isPinned: boolean;
  replies: Reply[];
  userReaction?: "like" | "dislike" | null;
}

interface Reply {
  id: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
    role: "student" | "mentor" | "organization";
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  replies: Reply[];
}

interface CommentSystemProps {
  lessonId: string;
}

export default function CommentSystem({ lessonId }: CommentSystemProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);

  const user = useSelector(selectCurrentUser); // Get current user
  const isMentor = user?.role === Role.mentor; // Check if user is a mentor
  const { data: comments = [], isLoading: isCommentsLoading, error } = useGetCommentsQuery(lessonId);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();
  const [toggleLike, { isLoading: isTogglingLike }] = useToggleLikeMutation();
  const [toggleDislike, { isLoading: isTogglingDislike }] = useToggleDislikeMutation();
  const [togglePin, { isLoading: isTogglingPin }] = useTogglePinMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
  const [deleteReply, { isLoading: isDeletingReply }] = useDeleteReplyMutation();
  const [editComment, { isLoading: isEditingComment }] = useEditCommentMutation();

  // Transform comments to include userReaction and handle missing fields
  const validComments = comments
    .filter((comment) => !!comment._id)
    .map((comment) => ({
      ...comment,
      likes: comment.likes || [],
      dislikes: comment.dislikes || [],
      userReaction: user?._id
        ? comment.likes?.includes(user._id)
          ? "like"
          : comment.dislikes?.includes(user._id)
          ? "dislike"
          : null
        : null,
    }));

  // Merge optimistic updates with API data
  const mergedComments = validComments.map((comment) => {
    const optimisticComment = optimisticComments.find((c) => c._id === comment._id);
    return optimisticComment ? { ...comment, ...optimisticComment } : comment;
  });

  if (validComments.length !== comments.length) {
    console.warn("Found comments with missing _id:", comments.filter((c) => !c._id));
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mentor":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "mentor":
        return "Mentor";
      case "student":
        return "Student";
      default:
        return "Student";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleReaction = async (commentId: string, reaction: "like" | "dislike") => {
    if (!commentId || !user?._id) {
      toast.error("Cannot toggle reaction: commentId or userId is undefined");
      return;
    }

    // Store original comment state for rollback
    const originalComment = mergedComments.find((c) => c._id === commentId);
    if (!originalComment) return;

    // Optimistic update
    const updatedLikes =
      reaction === "like"
        ? originalComment.userReaction === "like"
          ? originalComment.likes.filter((id) => id !== user._id)
          : [...originalComment.likes, user._id]
        : originalComment.userReaction === "dislike"
        ? originalComment.likes.filter((id) => id !== user._id)
        : originalComment.likes;

    const updatedDislikes =
      reaction === "dislike"
        ? originalComment.userReaction === "dislike"
          ? originalComment.dislikes.filter((id) => id !== user._id)
          : [...originalComment.dislikes, user._id]
        : originalComment.userReaction === "like"
        ? originalComment.dislikes.filter((id) => id !== user._id)
        : originalComment.dislikes;

    const updatedComment = {
      ...originalComment,
      likes: updatedLikes,
      dislikes: updatedDislikes,
      userReaction:
        reaction === "like"
          ? originalComment.userReaction === "like"
            ? null
            : "like"
          : originalComment.userReaction === "dislike"
          ? null
          : "dislike" as const,
    };

   setOptimisticComments((prev) =>
  prev.map((c) => (c._id === commentId ? (updatedComment as Comment) : c))
);


    try {
      if (reaction === "like") {
        await toggleLike({ commentId }).unwrap();
        toast.success("Like updated successfully");
      } else {
        await toggleDislike({ commentId }).unwrap();
        toast.success("Dislike updated successfully");
      }
    } catch (err) {
      console.error(`Failed to ${reaction} comment:`, err);
      toast.error(`Failed to update ${reaction}`);
      // Rollback to original state
      setOptimisticComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  };

  const handlePin = async (commentId: string, currentIsPinned: boolean) => {
    if (!commentId) {
      toast.error("Cannot toggle pin: commentId is undefined");
      return;
    }
    try {
      const newPinState = !currentIsPinned;
      await togglePin({ commentId, isPinned: newPinState }).unwrap();
      toast.success(newPinState ? "Comment pinned successfully" : "Comment unpinned successfully");
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      toast.error("Failed to toggle pin");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      await addComment({
        lessonId,
        content: newComment,
      }).unwrap();
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    if (!parentId) {
      toast.error("Cannot add reply: parentId is undefined");
      return;
    }
    try {
      await addReply({
        commentId: parentId,
        content: replyText,
      }).unwrap();
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply added successfully");
    } catch (err) {
      console.error("Failed to add reply:", err);
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentId) {
      toast.error("Cannot delete comment: commentId is undefined");
      return;
    }
    try {
      await deleteComment({ commentId }).unwrap();
      toast.success("Comment deleted successfully");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!commentId || !replyId) {
      toast.error("Cannot delete reply: commentId or replyId is undefined");
      return;
    }
    try {
      await deleteReply({ commentId, replyId }).unwrap();
      toast.success("Reply deleted successfully");
    } catch (err) {
      console.error("Failed to delete reply:", err);
      toast.error("Failed to delete reply");
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!commentId || !content.trim()) {
      toast.error("Cannot edit comment: commentId or content is undefined");
      return;
    }
    try {
      await editComment({ commentId, content }).unwrap();
      setEditingComment(null);
      setEditText("");
      toast.success("Comment updated successfully");
    } catch (err) {
      console.error("Failed to edit comment:", err);
      toast.error("Failed to edit comment");
    }
  };

  const startEditingComment = (comment:any) => {
    setEditingComment(comment._id);
    setEditText(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditText("");
  };

  const sortedComments = [...mergedComments].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "popular":
        return (b.likes.length - b.dislikes.length) - (a.likes.length - a.dislikes.length);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const pinnedComments = sortedComments.filter((c) => c.isPinned);
  const regularComments = sortedComments.filter((c) => !c.isPinned);

  if (isCommentsLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading comments: {JSON.stringify(error)}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full mx-auto overflow-auto">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion ({mergedComments.length})
            </CardTitle>
            <CardDescription>Join the conversation about this lesson</CardDescription>
          </div>
       <Select
  value={sortBy}
  onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "popular")}
>
  <SelectTrigger className="w-full sm:w-[200px] text-sm">
    <SelectValue placeholder="Sort By" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="newest">Newest First</SelectItem>
    <SelectItem value="oldest">Oldest First</SelectItem>
    <SelectItem value="popular">Most Popular</SelectItem>
  </SelectContent>
</Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Comment Form */}
          <div className="space-y-2">
            <Textarea
              placeholder="Ask a question or share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] w-full"
              disabled={isAddingComment}
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} disabled={isAddingComment || !newComment.trim()}>
                {isAddingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-3 w-3 mr-2" />
                )}
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
                <Card key={comment._id} className="bg-blue-50/50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <Badge variant="outline" className={getRoleColor(comment.author.role)}>
                            {getRoleLabel(comment.author.role)}
                          </Badge>
                          {isMentor && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => handlePin(comment._id, comment.isPinned)}
                              disabled={isTogglingPin}
                            >
                              {isTogglingPin ? (
                                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                              ) : (
                                <Pin className="h-3 w-3 text-blue-500" />
                              )}
                            </Button>
                          )}
                          {user?._id === comment.author._id && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => startEditingComment(comment)}
                                disabled={isEditingComment}
                              >
                                <Pencil className="h-3 w-3 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={isDeletingComment}
                              >
                                {isDeletingComment ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                )}
                              </Button>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(comment.createdAt)}
                          </span>
                        </div>
                        {editingComment === comment._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[60px] text-sm w-full"
                              disabled={isEditingComment}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment._id, editText)}
                                disabled={isEditingComment || !editText.trim()}
                              >
                                {isEditingComment ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingComment}
                                disabled={isEditingComment}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{comment.content}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4">
                          <Button
                            variant={comment.userReaction === "like" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              comment.userReaction === "like" && "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                            onClick={() => handleReaction(comment._id, "like")}
                            disabled={isTogglingLike}
                          >
                            {isTogglingLike ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <ThumbsUp
                                className="h-3 w-3 mr-1"
                                fill={comment.userReaction === "like" ? "currentColor" : "none"}
                              />
                            )}
                            {comment.likes.length}
                          </Button>
                          <Button
                            variant={comment.userReaction === "dislike" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              comment.userReaction === "dislike" && "bg-red-600 text-white hover:bg-red-700"
                            )}
                            onClick={() => handleReaction(comment._id, "dislike")}
                            disabled={isTogglingDislike}
                          >
                            {isTogglingDislike ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <ThumbsDown
                                className="h-3 w-3 mr-1"
                                fill={comment.userReaction === "dislike" ? "currentColor" : "none"}
                              />
                            )}
                            {comment.dislikes.length}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setReplyingTo(comment._id)}
                            disabled={isAddingReply}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-0 sm:ml-4 space-y-2 border-l-0 sm:border-l-2 border-muted pl-0 sm:pl-4">
                            {comment.replies
                              .filter((reply) => !!reply.id)
                              .map((reply) => (
                                <div key={reply.id} className="flex flex-col sm:flex-row gap-2">
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
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-medium text-xs">{reply.author.name}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getRoleColor(reply.author.role)}`}
                                      >
                                        {getRoleLabel(reply.author.role)}
                                      </Badge>
                                      {user?._id === reply.author._id && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 p-0"
                                          onClick={() => handleDeleteReply(comment._id, reply.id!)}
                                          disabled={isDeletingReply}
                                        >
                                          {isDeletingReply ? (
                                            <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                                          ) : (
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                          )}
                                        </Button>
                                      )}
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
                        {replyingTo === comment._id && (
                          <div className="ml-0 sm:ml-4 space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[60px] text-sm w-full"
                              disabled={isAddingReply}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddReply(comment._id)}
                                disabled={isAddingReply || !replyText.trim() || !comment._id}
                              >
                                {isAddingReply ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  "Reply"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                                disabled={isAddingReply}
                              >
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
              <Card key={comment._id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <Badge variant="outline" className={getRoleColor(comment.author.role)}>
                          {getRoleLabel(comment.author.role)}
                        </Badge>
                        {isMentor && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => handlePin(comment._id, comment.isPinned)}
                            disabled={isTogglingPin}
                          >
                            {isTogglingPin ? (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                            ) : (
                              <Pin className="h-3 w-3 text-blue-500" />
                            )}
                          </Button>
                        )}
                        {user?._id === comment.author._id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => startEditingComment(comment)}
                              disabled={isEditingComment}
                            >
                              <Pencil className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteComment(comment._id)}
                              disabled={isDeletingComment}
                            >
                              {isDeletingComment ? (
                                <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-3 w-3 text-red-500" />
                              )}
                            </Button>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                      </div>
                      {editingComment === comment._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[60px] text-sm w-full"
                            disabled={isEditingComment}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment._id, editText)}
                              disabled={isEditingComment || !editText.trim()}
                            >
                              {isEditingComment ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingComment}
                              disabled={isEditingComment}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{comment.content}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4">
                        <Button
                          variant={comment.userReaction === "like" ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs",
                            comment.userReaction === "like" && "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                          onClick={() => handleReaction(comment._id, "like")}
                          disabled={isTogglingLike}
                        >
                          {isTogglingLike ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <ThumbsUp
                              className="h-3 w-3 mr-1"
                              fill={comment.userReaction === "like" ? "currentColor" : "none"}
                            />
                          )}
                          {comment.likes.length}
                        </Button>
                        <Button
                          variant={comment.userReaction === "dislike" ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs",
                            comment.userReaction === "dislike" && "bg-red-600 text-white hover:bg-red-700"
                          )}
                          onClick={() => handleReaction(comment._id, "dislike")}
                          disabled={isTogglingDislike}
                        >
                          {isTogglingDislike ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <ThumbsDown
                              className="h-3 w-3 mr-1"
                              fill={comment.userReaction === "dislike" ? "currentColor" : "none"}
                            />
                          )}
                          {comment.dislikes.length}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setReplyingTo(comment._id)}
                          disabled={isAddingReply}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-0 sm:ml-4 space-y-2 border-l-0 sm:border-l-2 border-muted pl-0 sm:pl-4">
                          {comment.replies
                            .filter((reply) => !!reply.id)
                            .map((reply) => (
                              <div key={reply.id} className="flex flex-col sm:flex-row gap-2">
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
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">{reply.author.name}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getRoleColor(reply.author.role)}`}
                                    >
                                      {getRoleLabel(reply.author.role)}
                                    </Badge>
                                    {user?._id === reply.author._id && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleDeleteReply(comment._id, reply.id!)}
                                        disabled={isDeletingReply}
                                      >
                                        {isDeletingReply ? (
                                          <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                                        ) : (
                                          <Trash2 className="h-3 w-3 text-red-500" />
                                        )}
                                      </Button>
                                    )}
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
                      {replyingTo === comment._id && (
                        <div className="ml-0 sm:ml-4 space-y-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[60px] text-sm w-full"
                            disabled={isAddingReply}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(comment._id)}
                              disabled={isAddingReply || !replyText.trim() || !comment._id}
                            >
                              {isAddingReply ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Reply"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                              disabled={isAddingReply}
                            >
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

          {mergedComments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs">Be the first to start the discussion!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}