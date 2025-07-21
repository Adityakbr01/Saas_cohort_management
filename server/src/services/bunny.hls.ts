import fs from "fs";
import path from "path";
import { uploadToBunny } from "./bunnyUploader";
import dotenv from "dotenv";

dotenv.config();

export const uploadHLSFolder = async (localDir: string, remoteDir: string): Promise<string> => {
  // Validate inputs
  if (!fs.existsSync(localDir)) {
    throw new Error(`Local directory does not exist: ${localDir}`);
  }
  if (!remoteDir) {
    throw new Error("Remote directory path is required");
  }
  if (!process.env.BUNNY_CDN_HOST) {
    throw new Error("BUNNY_CDN_HOST environment variable is not set");
  }

  // Clean inputs
  const cleanBunnyCdnHost = process.env.BUNNY_CDN_HOST!

  const cleanRemoteDir = remoteDir
    .replace(/[\u{0000}-\u{001F}\u{200B}-\u{200F}\u{FEFF}\u{2060}]/gu, "") // Remove all control chars, including U+2060
    .replace(/[^a-zA-Z0-9_/-]/g, "") // Allow only alphanumeric, _, /, -
    .replace(/\/+/g, "/") // Normalize slashes
    .trim()
    .replace(/^\/+/, "") // Remove leading slashes
    .replace(/\/+$/, ""); // Remove trailing slashes

  // Upload files
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = `${cleanRemoteDir}/${file}`;

    console.log(`📤 Uploading: ${localPath} ➡️ ${remotePath}`);
    await uploadToBunny(localPath, remotePath);
  }

  // Construct and clean HLS URL
  const hlsUrl = `${cleanBunnyCdnHost}/${cleanRemoteDir}/index.m3u8`

  // Log URL and raw bytes for debugging
  console.log(`✅ Uploaded HLS URL: ${hlsUrl}`);


  console.log(`✅ HLS URL   aaaaaaaa: ${hlsUrl}`);

  return hlsUrl;
};