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
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

const router = express.Router();

// ---------------- Rate Limiters ---------------- //
const commentLimiter = createDynamicRateLimiter({ maxRequests: 20, timeWindow: 10 });       // Comments, replies
const reactionLimiter = createDynamicRateLimiter({ maxRequests: 50, timeWindow: 10 });      // Like/Dislike
const getCommentsLimiter = createDynamicRateLimiter({ maxRequests: 60, timeWindow: 10 });   // Fetch comments
const editDeleteLimiter = createDynamicRateLimiter({ maxRequests: 15, timeWindow: 10 });    // Edit/Delete
const pinLimiter = createDynamicRateLimiter({ maxRequests: 10, timeWindow: 10 });           // Pin comment
// ------------------------------------------------ //

// Create a new comment
router.post("/", protect, commentLimiter, createComment);

// Add a reply to a comment
router.post("/:commentId/reply", protect, commentLimiter, addReplyToComment);

// Get all comments for a lesson
router.get("/lesson/:lessonId", protect, getCommentsLimiter, getCommentsByLesson);

// Like a comment
router.post("/:commentId/like", protect, reactionLimiter, toggleLikeComment);

// Dislike a comment
router.post("/:commentId/dislike", protect, reactionLimiter, toggleDislikeComment);

// Pin or unpin a comment
router.post("/:commentId/pin", protect, restrictTo("mentor"), pinLimiter, pinComment);

// Edit comment
router.put("/:commentId", protect, editDeleteLimiter, editComment);

// Delete comment
router.delete("/:commentId", protect, editDeleteLimiter, deleteComment);

// Delete reply
router.delete("/:commentId/reply/:replyId", protect, editDeleteLimiter, deleteReply);

export default router;
