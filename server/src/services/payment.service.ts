import mongoose from "mongoose";
import crypto from "crypto";
import { Request } from "express";
import razorpay from "@/lib/razorpay";
import { SubscriptionModel } from "@/models/subscriptionModel";
import User from "@/models/userModel";
import { UserDAO } from "@/dao/user.dao";
import { ApiError } from "@/utils/apiError";
import { sendSuccess } from "@/utils/responseUtil";
import {logger} from "@/utils/logger";
import { SubscriptionDao } from "@/dao/subscription.dao";

export const PaymentService = {
  async processPayment(subscriptionId: string, currency = "INR", userId?: string) {
    if (!mongoose.isValidObjectId(subscriptionId)) {
      throw new ApiError(400, "Invalid subscription ID");
    }

    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    const options = {
      amount: subscription.price * 100,
      currency,
      receipt: `receipt_${subscriptionId}`,
      notes: {
        subscriptionId,
        userId: userId || "anonymous",
      },
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error: any) {
      logger.error("Error creating Razorpay order:", error);
      throw new ApiError(500, "Failed to create order");
    }
  },

  async verifyPayment(req: Request) {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      subscriptionId,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !subscriptionId) {
      throw new ApiError(400, "Missing required field");
    }

    if (!mongoose.isValidObjectId(subscriptionId)) {
      throw new ApiError(400, "Invalid subscription ID");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    const subscription = await SubscriptionDao.findSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    const userId = req.user?.id;

    if (userId && !subscription.subscribers?.includes(new mongoose.Types.ObjectId(userId))) {
      subscription.subscribers?.push(userId as any);

      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(now.getMonth() + 1);

      await UserDAO.updateUserPlan(userId, subscription._id, {
        startDate: now,
        expiresDate: oneMonthLater,
        isActive: true,
        isExpired: false,
      });

      await SubscriptionDao.saveSubscription(subscription);
    }

    return {
      success: true,
      message: "Payment verified successfully",
      subscriptionId,
      userId,
    }
  }
};
