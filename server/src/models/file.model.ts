// src/models/fileModel.ts
import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  publicUrl: { type: String, required: true },
  fileId: { type: String, required: true }, // Cloudinary public_id
  fileType: { type: String, enum: ["image", "video", "audio", "pdf"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("File", fileSchema);