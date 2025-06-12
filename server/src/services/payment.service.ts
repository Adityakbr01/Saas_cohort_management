import mongoose from "mongoose";
import crypto from "crypto";
import { Request } from "express";
import razorpay from "@/lib/razorpay";
import { SubscriptionModel } from "@/models/subscriptionModel";
import { UserDAO } from "@/dao/user.dao";
import { SubscriptionDao } from "@/dao/subscription.dao";
import { ApiError } from "@/utils/apiError";
import { logger } from "@/utils/logger";

export const PaymentService = {
  async processPayment(subscriptionId: string, amount: number, currency = "INR", userId?: string) {
    if (!mongoose.isValidObjectId(subscriptionId)) {
      throw new ApiError(400, "Invalid subscription ID");
    }

    const subscription = await SubscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    // Validate amount against subscription price
    const expectedAmount = subscription.price * 100; // Convert to paise
    if (amount < expectedAmount) {
      throw new ApiError(400, `Amount mismatch: expected ${expectedAmount} paise, received ${amount} paise`);
    }

    const options = {
      amount, // In paise
      currency,
      receipt: `receipt_${subscriptionId}}`,
      notes: {
        subscriptionId,
        userId: userId || "anonymous",
      },
      payment_capture: 1, // Auto-capture payment
    };

    try {
      const order = await razorpay.orders.create(options);
      logger.info("[PaymentService] Order created:", { orderId: order.id, subscriptionId });
      return order;
    } catch (error: any) {
      logger.error("[PaymentService] Error creating Razorpay order:", error);
      console.log(error)
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

    // Strict validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !subscriptionId) {
      logger.warn("[PaymentService] Missing required payment fields:", req.body);
      throw new ApiError(400, "Missing required payment fields");
    }

    if (!mongoose.isValidObjectId(subscriptionId)) {
      throw new ApiError(400, "Invalid subscription ID");
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      logger.warn("[PaymentService] Invalid payment signature:", { razorpay_order_id });
      throw new ApiError(400, "Invalid payment signature");
    }

    const subscription = await SubscriptionDao.findSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    // Check if payment is already processed
    const isAlreadySubscribed = subscription.subscribers?.includes(new mongoose.Types.ObjectId(userId));
    if (isAlreadySubscribed) {
      logger.warn("[PaymentService] User already subscribed:", { userId, subscriptionId });
      throw new ApiError(400, "User already subscribed to this plan");
    }

    // Update subscription and user
    subscription.subscribers?.push(new mongoose.Types.ObjectId(userId));

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

    logger.info("[PaymentService] Payment verified successfully:", { razorpay_payment_id, subscriptionId });
    return {
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        subscriptionId,
        userId,
      },
    };
  },
};