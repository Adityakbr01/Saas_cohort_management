import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const BUNNY_STORAGE_NAME = process.env.BUNNY_STORAGE_NAME || "";
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_NAME}`;

export const uploadToBunny = async (filePath: string, remotePath: string) => {

  console.log(`Uploading to Bunny CDN: ${remotePath}`);

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