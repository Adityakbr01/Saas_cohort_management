import { Cohort } from "@/models/cohort.model";
import cron from "node-cron";

export const startActivateUpcomingCohortsByDateJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const cohorts = await Cohort.find({
        status: "upcoming",
        activateOn: { $lte: now },
        isDeleted: false,
      });

      for (const cohort of cohorts) {
        cohort.status = "active";
        cohort.activateOn = undefined;
        await cohort.save();

        console.log(`🎯 Activated cohort "${cohort.title}" based on activateOn date`);
      }
    } catch (err) {
      console.error("[CRON] ❌ Error in activateUpcomingCohortsByDateJob:", err);
    }
  }, {
    timezone: "Asia/Kolkata",
  });

  console.log("[CRON] ✅ Scheduled: Activate Upcoming Cohorts every minute");
};
