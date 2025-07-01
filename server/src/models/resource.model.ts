import mongoose, { Schema } from "mongoose";

interface IResource extends Document {
  title: string;
  type: "pdf" | "link" | "image" | "code";
  url: string;
}

const resourceSchema = new Schema<IResource>(
  {
    title: String,
    type: {
      type: String,
      enum: ["pdf", "link", "image", "code"],
      required: true,
    },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
