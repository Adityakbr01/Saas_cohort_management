import ffmpeg from "fluent-ffmpeg"; // ⬅️ Add this at top if not already

// Utility function to get duration
const getVideoDuration = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
};

export default getVideoDuration;
