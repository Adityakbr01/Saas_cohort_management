// ✅ Corrected dynamic uploadMedia function
import { RequestHandler } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "video/mp4", 
  "video/webm",
   "image/webp",
  "video/mpeg",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "image/svg+xml",
  "application/pdf",
  "application/json",
];


const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("Invalid file type:", file.mimetype);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)); 
  }
};

const baseUpload = multer({
  storage,
  limits: { fileSize: 95 * 1024 * 1024 },
  fileFilter,
});

/**
 * Dynamic middleware creator
 */
export const uploadMedia = (
  fields?: string | string[]
): RequestHandler => {
  if (typeof fields === "string") {
    return baseUpload.single(fields);
  }

  if (Array.isArray(fields)) {
    const formatted = fields.map((field) => ({ name: field, maxCount: 1 }));
    return baseUpload.fields(formatted);
  }

  // ✅ Default to .any() if no field passed or unknown type
  return baseUpload.any();
};
