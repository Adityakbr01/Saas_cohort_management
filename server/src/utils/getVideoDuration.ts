import ffmpeg from "fluent-ffmpeg";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";

const getVideoDurationFromBuffer = async (buffer: Buffer): Promise<number> => {
  const tmpDir = os.tmpdir();
  const tempFilePath = path.join(tmpDir, `${randomUUID()}.mp4`);

  try {
    await writeFile(tempFilePath, buffer);

    const probe = async (): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
          if (err) return reject(err);
          resolve(metadata.format.duration || 0);
        });
      });
    };

    // Retry logic
    let attempts = 0;
    while (attempts < 3) {
      try {
        const duration = await probe();
        return duration;
      } catch (e) {
        attempts++;
        console.warn(`Attempt ${attempts} failed, retrying...`);
        await new Promise(r => setTimeout(r, 100)); // wait 100ms
      }
    }

    return 0; // All retries failed
  } catch (err) {
    console.error("❌ Failed to get video duration:", err);
    return 0;
  } finally {
    await unlink(tempFilePath).catch(() => {});
  }
};

export default getVideoDurationFromBuffer;
