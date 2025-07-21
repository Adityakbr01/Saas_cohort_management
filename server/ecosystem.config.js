// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "lms-api", // ✅ Your main backend server
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "video-worker", // ✅ FFmpeg + Cloudinary background processing
      script: "dist/jobs/workers/video.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "cron-job", // ✅ Subscription checker or other recurring tasks
      script: "dist/utils/Cron/subscriptionCron.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
