import ffmpeg from "fluent-ffmpeg";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";

const getVideoDurationFromBuffer = async (buffer: Buffer): Promise<number> => {
  const tmpDir = os.tmpdir();
  const tempFilePath = path.join(tmpDir, `${randomUUID()}.mp4`);

  try {
    // Step 1: Save buffer to a temporary file
    await writeFile(tempFilePath, buffer);

    // Step 2: Use ffprobe to get duration
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });

    return duration;
  } catch (err) {
    console.error("❌ Failed to get video duration:", err);
    return 0;
  } finally {
    // Step 3: Delete the temporary file
    await unlink(tempFilePath).catch(() => {});
  }
};

export default getVideoDurationFromBuffer;
