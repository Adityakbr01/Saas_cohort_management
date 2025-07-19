import { startActivateUpcomingCohortsByDateJob } from "./activateUpcomingCohortsByDate";
import { startPingBackendJob } from "./ActiveBAckend";
import { startOfferExpirationJob } from "./offerExpirationJob";

export const startAllCronJobs = () => {
  console.log("[CRON] 🚀 Initializing all cron jobs...");

  startActivateUpcomingCohortsByDateJob();
  startOfferExpirationJob();
  startPingBackendJob();

  console.log("[CRON] ✅ All cron jobs initialized successfully");
};
