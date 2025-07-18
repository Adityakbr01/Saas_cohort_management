import mongoose from "mongoose";

const userCohortProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort", required: true },

    // Basic Progress
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    totalLessons: { type: Number, default: 0 }, // Set at enrollment
    timeSpentMinutes: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },

    // Progress % by content type
    byType: {
      video: { type: Number, default: 0 },
      reading: { type: Number, default: 0 },
      quiz: { type: Number, default: 0 },
      assignment: { type: Number, default: 0 },
      project: { type: Number, default: 0 },
    },

    // Streak & Engagement
    streak: { type: Number, default: 0 },
    streakDays: [{ type: Date }],

    // Achievements
    achievements: [{ type: String }],

    // Timestamps
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("UserCohortProgress", userCohortProgressSchema);
