import { startActivateUpcomingCohortsByDateJob } from "./activateUpcomingCohortsByDate";
import { startOfferExpirationJob } from "./offerExpirationJob";

export const startAllCronJobs = () => {
  console.log("[CRON] 🚀 Initializing all cron jobs...");

  startActivateUpcomingCohortsByDateJob();
  startOfferExpirationJob();

  console.log("[CRON] ✅ All cron jobs initialized successfully");
};
