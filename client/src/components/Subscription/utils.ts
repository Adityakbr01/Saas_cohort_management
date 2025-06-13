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

  apiPlans.forEach((apiPlan) => {
    const normalizedName = apiPlan.name.toLowerCase();
    planMap[normalizedName] = {
      name: apiPlan.name.charAt(0).toUpperCase() + apiPlan.name.slice(1),
      price: apiPlan.price,
      description: apiPlan.description,
      icon: iconMap[normalizedName] || BookOpen,
      color: colorMap[normalizedName] || "bg-blue-500",
      popular: apiPlan.popular,
      features: apiPlan.features.map((feature) => ({
        name: feature,
        included: true,
      })),
      _id: apiPlan._id,
    };
  });

  const yearlyPlans: { [key: string]: Plan } = {};
  Object.entries(planMap).forEach(([key, plan]) => {
    const yearlyPrice = Math.round(plan.price * 12 * 0.83);
    const originalPrice = plan.price * 12;
    yearlyPlans[key] = {
      ...plan,
      price: yearlyPrice,
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