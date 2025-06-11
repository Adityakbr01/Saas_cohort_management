import { SubscriptionModel } from "@/models/subscriptionModel";
import { ApiError } from "@/utils/apiError";

export class SubscriptionDao {
  static async getAllSubscriptions() {
    try {
      const subscriptions = await SubscriptionModel.find();
      return subscriptions;
    } catch (error: any) {
      // Optional: Log the actual error if you're using winston/pino
      console.error("Error fetching subscriptions:", error);
      throw new Error("Error fetching subscriptions: " + error.message);
    }
  }
  static async createSubscription(data: { name: string; price: number,description:string,features:string[],popular:boolean,userId?: string }) {
    try {
      const  {name,price,description,features,popular,userId} = data;
      const subscription = new SubscriptionModel(
        {
          name,
          price,
          description,
          features,
          popular,
          Owner: userId, 
        }
      );
      return await subscription.save();
    } catch (error: any) {
      throw new Error("Error creating subscription: " + error.message);
    }
  }
  static async getSubscriptionById(id: string) {
    return SubscriptionModel.findById(id);
  }

  static async updateSubscription(
    id: string,
    data: { name: string; price: number, description: string; features: string[]; popular: boolean; userId?: string }
  ) {
    const existing = await SubscriptionModel.findOne({ name: data.name });
    if (existing && existing._id.toString() !== id) {
      throw new ApiError(
        400,
        "Another subscription with this name already exists"
      );
    }
    return SubscriptionModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteSubscription(id: string) {
    return SubscriptionModel.findByIdAndDelete(id);
  }
}
