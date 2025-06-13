import { BookOpen, Building2, Star, type LucideIcon } from "lucide-react";
import type { ApiPlan, Plan, SubscriptionPlans } from "./types";

export const createSubscriptionPlans = (apiPlans: ApiPlan[]): SubscriptionPlans => {
  const planMap: { [key: string]: Plan } = {};
  const iconMap: { [key: string]: LucideIcon } = {
    basic: BookOpen,
    pro: Star,
    business: Building2,
  };
  const colorMap: { [key: string]: string } = {
    basic: "bg-blue-500",
    pro: "bg-purple-500",
    business: "bg-green-500",
  };

  if (!apiPlans || !Array.isArray(apiPlans)) {
    return { monthly: {}, yearly: {} };
  }

  apiPlans.forEach((apiPlan) => {
    const normalizedName = apiPlan.name.toLowerCase();
    const features = apiPlan.features.map((feature) => ({
      name: feature,
      included: true,
    }));

    // Use API discount if provided, else default to 20%
    const discount = apiPlan.discount ? 1 - apiPlan.discount / 100 : 0.8;
    const yearlyPrice = apiPlan.yearlyPrice ?? Math.round(apiPlan.price * 12 * discount);

    planMap[normalizedName] = {
      name: apiPlan.name.charAt(0).toUpperCase() + apiPlan.name.slice(1),
      price: apiPlan.price,
      yearlyPrice,
      originalPrice: undefined,
      description: apiPlan.description,
      icon: iconMap[normalizedName] || BookOpen,
      color: colorMap[normalizedName] || "bg-blue-500",
      popular: apiPlan.popular,
      tax: apiPlan.tax ?? 0,
      discount: apiPlan.discount ?? 0,
      features,
      _id: apiPlan._id,
    };
  });

  const yearlyPlans: { [key: string]: Plan } = {};
  Object.entries(planMap).forEach(([key, plan]) => {
    const originalPrice = plan.price * 12; // Full yearly price
    yearlyPlans[key] = {
      ...plan,
      price: plan.yearlyPrice,
      originalPrice,
    };
  });

  return {
    monthly: {
      basic: planMap.basic,
      pro: planMap.pro,
      business: planMap.business,
    },
    yearly: {
      basic: yearlyPlans.basic,
      pro: yearlyPlans.pro,
      business: yearlyPlans.business,
    },
  };
};