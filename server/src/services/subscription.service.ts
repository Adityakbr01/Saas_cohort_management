import { ApiError } from "@/utils/apiError";
import { SubscriptionModel } from "@/models/subscriptionModel"; // assume this is your mongoose model
import { SortOrder } from "mongoose";

type SubscriptionData = {
  price: number;
  name: string;
  description: string;
  features: string[];
  popular: boolean;
  userId?: string;
  tax: number;
  yearlyPrice: number;
  discount: number;
  maxStudents: number;
  maxMentors: number;
  maxCourses: number;
};

export const SubscriptionService = {
  async createSubscription({
    price,
    yearlyPrice,
    name,
    description,
    features,
    popular,
    tax,
    discount,
    userId,
    maxStudents,
    maxMentors,
    maxCourses,
  }: SubscriptionData) {
    const existing = await SubscriptionModel.find({});
    if (existing.some((sub) => sub.name === name)) {
      throw new ApiError(400, "Subscription name already exists");
    }
    if (existing.length >= 3) {
      throw new ApiError(400, "Only 3 subscriptions allowed");
    }

    console.log(userId);

    const newSubscription = new SubscriptionModel({
      name,
      price,
      yearlyPrice,
      description,
      features,
      popular,
      tax,
      discount,
      Owner: userId, // Map userId to Owner
      maxStudents,
      maxMentors,
      maxCourses,
    });

    return await newSubscription.save();
  },

  getAllSubscriptionsByPrice: async (sortOrder: SortOrder = 1) => {
    return await SubscriptionModel.find().sort({ price: sortOrder });
  },

  async getSubscriptionById(id: string) {
    const sub = await SubscriptionModel.findById(id);
    if (!sub) throw new ApiError(404, "Subscription not found");
    return sub;
  },

  async updateSubscription(id: string, data: SubscriptionData) {
    const existing = await SubscriptionModel.findById(id);
    if (!existing) throw new ApiError(404, "Subscription not found");

    Object.assign(existing, data);
    return await existing.save();
  },

  async deleteSubscription(id: string) {
    const existing = await SubscriptionModel.findById(id);
    if (!existing) throw new ApiError(404, "Subscription not found");
    return await SubscriptionModel.findByIdAndDelete(id);
  },
};
