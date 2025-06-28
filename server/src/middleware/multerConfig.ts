// src/middleware/multerConfig.ts
import { Request } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB for videos
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/mpeg",
      "audio/mpeg",
      "audio/mp3",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, MP4, MPEG, MP3, or PDF files are allowed"), false);
    }
  },
});

export const uploadMedia = upload.single("media");