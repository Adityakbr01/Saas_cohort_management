import {type  LucideIcon } from "lucide-react";

export interface Feature {
  name: string;
  included: boolean;
}

export interface Plan {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  icon: LucideIcon;
  color: string;
  popular: boolean;
  features: Feature[];
  _id: string;
}

export interface SubscriptionPlans {
  monthly: {
    basic: Plan;
    pro: Plan;
    business: Plan;
  };
  yearly: {
    basic: Plan;
    pro: Plan;
    business: Plan;
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
  originalPrice?: number;
  description: string;
  billing: "monthly" | "yearly";
  planId: string;
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
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  billingAddress: BillingAddress;
  agreeToTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  currentStep: number;
  isProcessing: boolean;
  paymentSuccess: boolean;
  formData: FormData;
  errors: FormErrors;
}

export type FormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_PAYMENT_SUCCESS"; payload: boolean }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<FormData> }
  | { type: "UPDATE_BILLING_ADDRESS"; payload: Partial<BillingAddress> }
  | { type: "SET_ERRORS"; payload: FormErrors }
  | { type: "CLEAR_ERROR"; payload: string };