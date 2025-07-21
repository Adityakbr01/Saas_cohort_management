
import { updateExpiredOffers } from "@/services/Cohort/updateExpiredOffers";
import cron from "node-cron";

export const startOfferExpirationJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("[CRON] 🔁 Running offer expiration check...");
      await updateExpiredOffers();
    } catch (error) {
      console.error("[CRON] ❌ Error in offer expiration job:", error);
    }
  }, {
    timezone: "Asia/Kolkata",
  });

  console.log("[CRON] ✅ Scheduled: Offer expiration every 10 minutes");
};
