// services/cohort/updateExpiredOffers.ts

import { Cohort } from "@/models/cohort.model";

export const updateExpiredOffers = async () => {
  const now = new Date();

  const expiredCohorts = await Cohort.find({
    "limitedTimeOffer.isActive": true,
    "limitedTimeOffer.endDate": { $lt: now },
  });

  const updated: string[] = [];

  for (const cohort of expiredCohorts) {
    cohort.price = cohort.originalPrice;
    cohort.discount = 0;
    cohort.limitedTimeOffer && (cohort.limitedTimeOffer.isActive = false);
    await cohort.save();
    updated.push(cohort._id.toString());
  }

  if (updated.length > 0) {
    console.log(`[CRON] Updated ${updated.length} expired offers:`, updated);
  }
};
