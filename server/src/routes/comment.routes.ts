import express from "express";
import {
    createComment,
    addReplyToComment,
    getCommentsByLesson,
    toggleLikeComment,
    toggleDislikeComment,
    pinComment,
    editComment,
    deleteComment,
    deleteReply,
} from "../controllers/comment.controller";
import { protect, restrictTo } from "@/middleware/authMiddleware";

const router = express.Router();

// Create a new comment
router.post("/", protect, createComment);

// Add a reply to a comment
router.post("/:commentId/reply", protect, addReplyToComment);

// Get all comments for a lesson
router.get("/lesson/:lessonId", protect, getCommentsByLesson);

// Like a comment
router.post("/:commentId/like", protect, toggleLikeComment);

// Dislike a comment
router.post("/:commentId/dislike", protect, toggleDislikeComment);

// Pin or unpin a comment
router.post("/:commentId/pin", protect, restrictTo("mentor"), pinComment);

// Edit comment
router.put("/:commentId", protect, editComment);

// Delete comment
router.delete("/:commentId", protect, deleteComment);

// Delete reply
router.delete("/:commentId/reply/:replyId", protect, deleteReply);

export default router;
