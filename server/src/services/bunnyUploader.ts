import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const BUNNY_STORAGE_NAME = "lms-videos-aditya";
const BUNNY_API_KEY = "33c09703-3218-4a1f-b1a67738850c-a9d3-4714";
const BUNNY_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_NAME}`;

export const uploadToBunny = async (filePath: string, remotePath: string) => {
  const fileBuffer = fs.readFileSync(filePath);
  const url = `${BUNNY_URL}/${remotePath}`;

  await axios.put(url, fileBuffer, {
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/octet-stream",
    },
  });

  console.log(`✅ Uploaded: ${remotePath}`);
};