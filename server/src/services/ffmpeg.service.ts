import { exec } from "child_process";
import fsExtra from "fs-extra";
import { promisify } from "util";

// Promisify exec for cleaner async/await handling
const execPromise = promisify(exec);

export const convertToHLS = async (inputPath: string, outputDir: string): Promise<void> => {
  await fsExtra.ensureDir(outputDir);
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${inputPath}" \
      -c:v libx264 -preset veryfast -b:v 2000k -maxrate 2200k -bufsize 4000k \
      -vf "scale=-2:720:force_original_aspect_ratio=decrease:force_divisible_by=2" \
      -c:a aac -b:a 128k -ar 44100 \
      -hls_time 6 -hls_list_size 0 \
      -hls_segment_filename "${outputDir}/segment_%03d.ts" \
      -f hls "${outputDir}/index.m3u8"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(`HLS conversion failed: ${stderr}`);
      resolve();
    });
  });
};
