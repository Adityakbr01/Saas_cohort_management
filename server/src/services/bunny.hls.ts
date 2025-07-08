import fs from "fs";
import path from "path";
import { uploadToBunny } from "./bunnyUploader";
import dotenv from "dotenv";

dotenv.config();

export const uploadHLSFolder = async (localDir: string, remoteDir: string): Promise<string> => {
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    await uploadToBunny(localPath, remotePath); // ye upload karta hai
  }

  const hlsUrl = `${process.env.BUNNY_CDN_HOST}/${remoteDir}/index.m3u8`;
  return hlsUrl;
};
