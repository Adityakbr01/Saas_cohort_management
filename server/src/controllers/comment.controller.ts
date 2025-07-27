import { Role } from "@/configs/roleConfig";
import { Comment } from "@/models/comment.model";
import Mentor from "@/models/mentor.model";
import Student from "@/models/student.model";
import { sendError } from "@/utils/responseUtil";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";


// ======================
// ✅ Create Comment
// ======================
export const createComment = async (req: Request, res: Response) => {
    try {
        const { content, lessonId } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole) {
             sendError(res, 401, "Unauthorized user");
             return
        }

        console.log("Creating comment:", content, "for lesson:", lessonId, "by user:", userId, "with role:", userRole);

        if (!content || !lessonId) {
             sendError(res, 400, "Content and lessonId are required");
             return
        }

        let user: any = null;
        switch (userRole) {
            case Role.student:
                user = await Student.findById(userId);
                break;
            case Role.mentor:
                user = await Mentor.findById(userId);
                break;
            default:
                 sendError(res, 400, "Invalid user role");
                 return
        }

        if (!user) {
            sendError(res, 404, "User not found");
            return;
        }

        const author = {
            name: user.name,
            avatar: user.avatar,
            role: userRole,
            _id: user._id, // Ensure we store the user ID
        };

        const newComment = await Comment.create({
            lesson: lessonId,
            content,
            author,
            likes: [],
            dislikes: [],
            isPinned: false,
            replies: [],
        });

        res.status(201).json(newComment);
    } catch (err) {
        console.error("Create comment error:", err);
        sendError(res, 500, "Failed to create comment");
    }
};
// ======================
// ✅ Add Reply
// ======================
export const addReplyToComment = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const { commentId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        console.log("Adding reply:", content, "to comment:", commentId, "by user:", userId, "with role:", userRole);

        if (!content) {
            sendError(res, 400, "Reply content is required");
            return;
        }

        let user: any = null;
        switch (userRole) {
            case "student":
                user = await Student.findById(userId);
                break;
            case "mentor":
                user = await Mentor.findById(userId);
                break;
            default:
                 sendError(res, 400, "Invalid user role");
                 return
        }

        if (!user) {
            sendError(res, 404, "User not found");
            return;
        }

        const reply = {
            id: uuidv4(),
            author: {
                name: user.name,
                avatar: user.avatar,
                role: userRole,
                _id: user._id, // Ensure we store the user ID
            },
            content,
            timestamp: new Date(),
            likes: 0,
            dislikes: 0,
            isPinned: false,
            replies: [],
        };

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $push: { replies: reply } },
            { new: true }
        );

        if (!updatedComment) {
            sendError(res, 404, "Comment not found");
            return;
        }

        res.status(200).json(updatedComment);
    } catch (err) {
        console.error("Add reply error:", err);
        sendError(res, 500, "Failed to add reply");
    }
};

// ======================
// ✅ Get Comments for a Lesson
// ======================
export const getCommentsByLesson = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const comments = await Comment.find({ lesson: lessonId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
        return
    } catch (err) {
        console.error("Fetch comments error:", err);
        sendError(res, 500, "Failed to fetch comments");
        return;
    }
};

// ======================
// ✅ Like Comment
// ======================
export const toggleLikeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    if (!req.user?.id) {
        sendError(res, 401, "Unauthorized");
        return;
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const comment = await Comment.findById(commentId);
    if (!comment) {
        sendError(res, 404, "Comment not found");
        return;
    }

    if (!Array.isArray(comment.likes)) comment.likes = [];
    if (!Array.isArray(comment.dislikes)) comment.dislikes = [];

    const hasLiked = comment.likes.some((id) => id.equals(userId));
    const hasDisliked = comment.dislikes.some((id) => id.equals(userId));

    if (hasLiked) {
      // Remove like
      comment.likes = comment.likes.filter((id) => !id.equals(userId));
    } else {
      // Remove dislike if exists
      if (hasDisliked) {
        comment.dislikes = comment.dislikes.filter((id) => !id.equals(userId));
      }
      // Add like
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: hasLiked ? "Unliked the comment" : "Liked the comment",
      likesCount: comment.likes.length,
      dislikesCount: comment.dislikes.length,
      commentId: comment._id,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    sendError(res, 500, "Failed to toggle like");
  }
};

// =====================
// ✅ Dislike Comment
// =====================
export const toggleDislikeComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;

        if (!req.user?.id) {
             sendError(res, 401, "Unauthorized");
             return
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const comment = await Comment.findById(commentId);
        if (!comment) {
             sendError(res, 404, "Comment not found");
             return
        }

        // Ensure likes/dislikes arrays exist
        if (!Array.isArray(comment.likes)) comment.likes = [];
        if (!Array.isArray(comment.dislikes)) comment.dislikes = [];

        const hasDisliked = comment.dislikes.some((id) => id.equals(userId));
        const hasLiked = comment.likes.some((id) => id.equals(userId));

        if (hasDisliked) {
            // Remove dislike (toggle off)
            comment.dislikes = comment.dislikes.filter((id) => !id.equals(userId));
        } else {
            // Add dislike
            comment.dislikes.push(userId);

            // Remove like if present
            if (hasLiked) {
                comment.likes = comment.likes.filter((id) => !id.equals(userId));
            }
        }

        await comment.save();

        res.status(200).json({
            message: hasDisliked ? "Removed dislike" : "Disliked the comment",
            likesCount: comment.likes.length,
            dislikesCount: comment.dislikes.length,
            commentId: comment._id,
        });
    } catch (err) {
        console.error("Toggle dislike error:", err);
        sendError(res, 500, "Failed to toggle dislike");
    }
};

// ======================
// ✅ Pin / Unpin Comment
// ======================
export const pinComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { isPinned } = req.body;

        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Validate user
        if (!userId) {
             sendError(res, 401, "Unauthorized");
                return
        }

        // Only mentors can pin/unpin
        if (userRole !== "mentor") {
             sendError(res, 403, "Only mentors can pin/unpin comments");
             return
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { isPinned },
            { new: true }
        );

        if (!updatedComment) {
            sendError(res, 404, "Comment not found");
            return;
        }

        res.status(200).json({
            message: isPinned ? "Comment pinned" : "Comment unpinned",
            commentId: updatedComment._id,
            isPinned: updatedComment.isPinned,
        });
    } catch (err) {
        console.error("Pin comment error:", err);
        sendError(res, 500, "Failed to pin/unpin comment");
    }
};

export const editComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!content) {
            sendError(res, 400, "Content is required");
            return;
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            sendError(res, 404, "Comment not found");
            return;
        }

        // Check author match
        let user: any = null;
        switch (userRole) {
            case "student":
                user = await Student.findById(userId);
                break;
            case "mentor":
                user = await Mentor.findById(userId);
                break;
            default:
                 sendError(res, 400, "Invalid user role");
                 return
        }

        if (!user) {
            sendError(res, 404, "User not found");
            return;
        }

        const isAuthor = comment.author._id.equals(user._id) && comment.author.role === userRole;
        if (!isAuthor) {
            sendError(res, 403, "You are not the author");
            return;
        }

        comment.content = content;
        await comment.save();

        res.status(200).json(comment);
    } catch (err) {
        console.error("Edit comment error:", err);
        sendError(res, 500, "Failed to edit comment");
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            sendError(res, 404, "Comment not found");
            return;
        }

        let user: any = null;
        switch (userRole) {
            case "student":
                user = await Student.findById(userId);
                break;
            case "mentor":
                user = await Mentor.findById(userId);
                break;
            case "admin":
                // Optional: handle admin from a different model
                break;
            default:
                 sendError(res, 400, "Invalid user role");
                 return
        }

        if (!user && userRole !== "admin") {
            sendError(res, 404, "User not found");
            return;
        }

        const isAuthor = comment.author._id.equals(user?._id) && comment.author.role === userRole;

        if (!isAuthor && userRole !== "admin") {
             sendError(res, 403, "You are not authorized to delete this comment");
             return
        }

        await comment.deleteOne();

        res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        console.error("Delete comment error:", err);
        sendError(res, 500, "Failed to delete comment");
    }
};

export const deleteReply = async (req: Request, res: Response) => {
    try {
        const { commentId, replyId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            sendError(res, 404, "Comment not found");
            return;
        }

        const reply = comment.replies.find((r: any) => r.id === replyId);
        if (!reply) {
            sendError(res, 404, "Reply not found");
            return;
        }

        let user: any = null;
        switch (userRole) {
            case "student":
                user = await Student.findById(userId);
                break;
            case "mentor":
                user = await Mentor.findById(userId);
                break;
            case "admin":
                break;
            default:
                 sendError(res, 400, "Invalid user role");
                 return
        }

        if (!user && userRole !== "admin") {
            sendError(res, 404, "User not found");
            return;
        }

        console.log("Deleting reply:", replyId, "from comment:", commentId, "by user:", userId, "with role:", userRole);

        const isAuthor = reply.author._id.equals(user?._id) && reply.author.role === userRole;

        if (!isAuthor && userRole !== "admin") {
             sendError(res, 403, "You are not authorized to delete this reply");
             return
        }

        comment.replies = comment.replies.filter((r: any) => r.id !== replyId);
        await comment.save();

        res.status(200).json({ message: "Reply deleted" });
    } catch (err) {
        console.error("Delete reply error:", err);
        sendError(res, 500, "Failed to delete reply");
    }
};

