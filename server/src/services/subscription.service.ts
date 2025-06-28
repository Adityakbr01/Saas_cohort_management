import { ApiError } from "@/utils/apiError";
import { SubscriptionModel } from "@/models/subscriptionModel"; // assume this is your mongoose model

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
    userId
  }: SubscriptionData) {
    const existing = await SubscriptionModel.find({});
    if (existing.some(sub => sub.name === name)) {
      throw new ApiError(400, 'Subscription name already exists');
    }
    if (existing.length >= 3) {
      throw new ApiError(400, 'Only 3 subscriptions allowed');
    }


    console.log(userId)

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
  });

    return await newSubscription.save();
  },

  async getAllSubscriptions() {
    return await SubscriptionModel.find({});
  },

  async getSubscriptionById(id: string) {
    const sub = await SubscriptionModel.findById(id);
    if (!sub) throw new ApiError(404, 'Subscription not found');
    return sub;
  },

  async updateSubscription(id: string, data: SubscriptionData) {
    const existing = await SubscriptionModel.findById(id);
    if (!existing) throw new ApiError(404, 'Subscription not found');
    
    Object.assign(existing, data);
    return await existing.save();
  },

  async deleteSubscription(id: string) {
    const existing = await SubscriptionModel.findById(id);
    if (!existing) throw new ApiError(404, 'Subscription not found');
    return await SubscriptionModel.findByIdAndDelete(id);
  },
};
