import { Schema, Types, model, Document } from "mongoose";

// ============================
// ✅ Author Subdocument Interface
// ============================
interface Author {
  name: string;
  avatar: string;
  role: "student" | "instructor" | "ta";
  _id: Types.ObjectId; // User ID (required for author)
}

// ============================
// ✅ Reply Interface
// ============================
interface Reply {
  id: string;  // Will store ObjectId as string
  author: Author;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  replies: Reply[]; // Nested replies (optional, for 1-level nesting)
}

// ============================
// ✅ Comment Interface
// ============================
export interface IComment extends Document {
  lesson: Types.ObjectId;
  content: string;
  author: Author;
  likes: Types.ObjectId[]; // Array of user IDs who liked the comment
  dislikes: Types.ObjectId[]; // Array of user IDs who disliked the comment
  isPinned: boolean;
  replies: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================
// ✅ Author Schema
// ============================
const authorSchema = new Schema<Author>(
  {
    name: { type: String, required: true },
    avatar: { type: String, required: false, default: "" },
    role: { type: String, enum: ["student", "mentor", "organization"], required: true },
    _id: { type: Schema.Types.ObjectId, required: true }
  }
);

// ============================
// ✅ Reply Schema (Recursive Nested Replies)
// ============================
const replySchema = new Schema<Reply>(
  {
    id: { type: String, required: true },
    author: { type: authorSchema, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    replies: [], // optional, limit to 1-level nesting for performance
  },
  { _id: false }
);

// ============================
// ✅ Main Comment Schema
// ============================
const commentSchema = new Schema<IComment>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    content: { type: String, required: true },
    author: { type: authorSchema, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User",default:[] }], // Array of user IDs who liked the comment
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User",default:[] }], // Array of user IDs who disliked the comment
    isPinned: { type: Boolean, default: false },
    replies: [replySchema],
  },
  { timestamps: true }
);

export const Comment = model<IComment>("Comment", commentSchema);
