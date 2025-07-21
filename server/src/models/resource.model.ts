import { Types } from "mongoose";
import { model, Schema, Document } from "mongoose";


// ============================
// ✅ Resource Model
// ============================
export interface IResource extends Document {
  _id: Types.ObjectId;
  lesson: Types.ObjectId;
  title: string;
  type: "pdf" | "link" | "doc";
  url: string;
  size?: string;
  description?: string;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["pdf", "link", "doc"], required: true },
    url: { type: String, required: true },
    size: { type: String },
    description: { type: String },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  },
  { timestamps: true }
);

export const LessonResource = model<IResource>("Resource", resourceSchema);