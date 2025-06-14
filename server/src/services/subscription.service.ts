import { SubscriptionDao } from "@/dao/subscription.dao";
import { ApiError } from "@/utils/apiError";

type SubscriptionData = {
  price: number;
  name: string;
  description: string;
  features: string[];
  popular: boolean;
  userId?: string;
  tax:number
  yearlyPrice:number
  discount:number
};

export const SubscriptionService = {
  async createSubscription({ price,yearlyPrice, name,description,features,popular,tax,discount,userId } : SubscriptionData) {
    const existing = await SubscriptionDao.getAllSubscriptions();
    if (existing.some(sub => sub.name === name)) {
      throw new ApiError(400, 'Subscription name already exists');
    }
    if (existing.length >= 3) {
      throw new ApiError(400, 'Only 3 subscriptions allowed');
    }
    return SubscriptionDao.createSubscription({ name, price,yearlyPrice,description,features,popular,tax,discount,userId });
  },

  async getAllSubscriptions() {
    return SubscriptionDao.getAllSubscriptions();
  },

  async getSubscriptionById(id: string) {
    const sub = await SubscriptionDao.getSubscriptionById(id);
    if (!sub) throw new ApiError(404, 'Subscription not found');
    return sub;
  },

  async updateSubscription(id: string, data: SubscriptionData) {
  const existing = await SubscriptionDao.getSubscriptionById(id);
  if (!existing) throw new ApiError(404, 'Subscription not found');
  return SubscriptionDao.updateSubscription(id, data);
},

  async deleteSubscription(id: string) {
    const existing = await SubscriptionDao.getSubscriptionById(id);
    if (!existing) throw new ApiError(404, 'Subscription not found');
    return SubscriptionDao.deleteSubscription(id);
  },
};
