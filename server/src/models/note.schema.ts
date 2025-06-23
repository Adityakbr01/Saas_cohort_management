// note.schema.ts
import { Schema } from "mongoose";

const noteSchema = new Schema({
  title: { type: String, default: "" },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: [
      "general",
      "performance",
      "engagement",
      "intervention",
      "goal",
      "other",
    ],
    default: "general",
  },
  content: { type: String, default: "" },
  tags: [{ type: String }],
  visibility: {
    type: String,
    enum: ["private", "mentor", "all"],
    default: "mentor",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
});

export default noteSchema;