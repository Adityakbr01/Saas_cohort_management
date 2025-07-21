import { type LucideIcon } from "lucide-react";

export interface Feature {
  name: string;
  included: boolean;
}

export interface Plan {
  name: string;
   price: number; // monthlyPrice
  yearlyPrice: number;
  originalPrice: number;
  description: string;
  icon: LucideIcon;
  color: string;
  popular: boolean;
  features: Feature[];
  _id: string;
  tax:number
  discount:number
}

export interface SubscriptionPlans {
  monthly: {
    basic?: Plan;
    pro?: Plan;
    business?: Plan;
  };
  yearly: {
    basic?: Plan;
    pro?: Plan;
    business?: Plan;
  };

}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  plan: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CheckoutPlan {
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  billing: "monthly" | "yearly";
  planId: string;
  tax:number
  discount:number
}

export interface ApiPlan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  subscribers: string[];
  Owner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  tax:number
  discount:number
  yearlyPrice:number
}