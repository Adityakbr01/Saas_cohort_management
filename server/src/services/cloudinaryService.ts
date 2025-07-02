import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

import fs from "fs";
import path from "path";
import { tmpdir } from "os";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper to convert buffer to stream
const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

// 1. Upload Image
export const uploadImage = async (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  try {
    console.log("[DEBUG] Uploading image to Cloudinary:", file.originalname);
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "lms/images",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            console.error("[DEBUG] Cloudinary image upload error:", error);
            return reject(
              new Error(
                `Image upload failed: ${error?.message || "Unknown error"}`
              )
            );
          }
          console.log(
            "[DEBUG] Image uploaded successfully:",
            result.secure_url
          );
          resolve(result);
        }
      );
      bufferToStream(file.buffer).pipe(stream);
    });
  } catch (error) {
    console.error("[DEBUG] uploadImage error:", error);
    throw error;
  }
};

// Helper to save buffer to temp file
const writeTempFile = (buffer: Buffer, filename: string): string => {
  const tempPath = path.join(tmpdir(), filename);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
};

// 2. Upload Video
// Updated uploadVideo with retry + chunked upload
export const uploadVideo = async (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lms/videos",
        resource_type: "video",
        chunk_size: 6 * 1024 * 1024, // 6MB
      },
      (error, result) => {
        if (error || !result) {
          console.error("[ERROR] Cloudinary video upload error:", error);
          return reject(
            new Error(
              `Video upload failed: ${error?.message || "Unknown error"}`
            )
          );
        }

        console.log("[DEBUG] ✅ Video uploaded successfully:", result.secure_url);
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    bufferToStream(file.buffer).pipe(stream);
  });
};



// 3. Upload Audio
export const uploadAudio = async (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  try {
    console.log("[DEBUG] Uploading audio to Cloudinary:", file.originalname);
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "lms/audio",
          resource_type: "video", // Audio treated as video in Cloudinary
        },
        (error, result) => {
          if (error || !result) {
            console.error("[DEBUG] Cloudinary audio upload error:", error);
            return reject(
              new Error(
                `Audio upload failed: ${error?.message || "Unknown error"}`
              )
            );
          }
          console.log(
            "[DEBUG] Audio uploaded successfully:",
            result.secure_url
          );
          resolve(result);
        }
      );
      bufferToStream(file.buffer).pipe(stream);
    });
  } catch (error) {
    console.error("[DEBUG] uploadAudio error:", error);
    throw error;
  }
};

// 4. Upload PDF
export const uploadPDF = async (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  try {
    console.log("[DEBUG] Uploading PDF to Cloudinary:", file.originalname);
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "lms/docs",
          resource_type: "raw",
        },
        (error, result) => {
          if (error || !result) {
            console.error("[DEBUG] Cloudinary PDF upload error:", error);
            return reject(
              new Error(
                `PDF upload failed: ${error?.message || "Unknown error"}`
              )
            );
          }
          console.log("[DEBUG] PDF uploaded successfully:", result.secure_url);
          resolve(result);
        }
      );
      bufferToStream(file.buffer).pipe(stream);
    });
  } catch (error) {
    console.error("[DEBUG] uploadPDF error:", error);
    throw error;
  }
};

// 5. Delete File (by public_id)
export const deleteFile = async (
  publicId: string,
  type: "image" | "video" | "raw"
): Promise<any> => {
  try {
    console.log("[DEBUG] Deleting file from Cloudinary:", publicId);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });
    if (result.result !== "ok") {
      console.error("[DEBUG] Cloudinary delete error: Result not OK");
      throw new Error("Delete failed");
    }
    console.log("[DEBUG] File deleted successfully:", publicId);
    return result;
  } catch (error) {
    console.error("[DEBUG] deleteFile error:", error);
    throw error;
  }
};
