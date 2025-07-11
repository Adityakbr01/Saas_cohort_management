// routes/paymentRouter.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Stripe from "stripe";
import { z } from "zod";

// import { processPayment, verifyPayment } from "@/controllers/paymentController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
// import {
//   createPayment,
//   processPayment,
//   ValidatePayment,
//   verifyPayment,
// } from "@/controllers/paymentController";
import { ApiError } from "@/utils/apiError";

import { validateRequest } from "@/middleware/validateRequest";
import { SubscriptionModel } from "@/models/subscriptionModel";
import User from "@/models/userModel";
import { Role } from "@/configs/roleConfig";
import mongoose from "mongoose";

export const paymentSchema = z.object({
  razorpay_payment_id: z.string().nonempty("Payment ID is required"),
  razorpay_order_id: z.string().nonempty("Order ID is required"),
  razorpay_signature: z.string().nonempty("Signature is required"),
  subscriptionId: z.string().nonempty("Subscription ID is required"),
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new ApiError(500, "Key Not Defin");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentRouter = express.Router();

// Payment routes

//payment create order with razorpay
// paymentRouter.post("/:subscriptionId/payment", protect, processPayment);

// // Payment verification route
// paymentRouter.post(
//   "/verify",
//   validateRequest(paymentSchema),
//   protect,
//   verifyPayment
// );

// paymentRouter.post("/create", createPayment);
// paymentRouter.post("/validate", ValidatePayment);

//Payment Route for stripe ---------------------------------------------------------------

paymentRouter.post(
  "/create-checkout-session",
  protect,
  express.json({ limit: "24kb" }),
  async (req, res) => {
    try {
      const { plan, currency = "INR", formData } = req.body.plan;
      const userId = req.user.id;

      if (!plan || !plan.planId) {
        throw new ApiError(400, "Plan object with valid planId is required.");
      }

      const existingPlan = await SubscriptionModel.findById(plan.planId);
      if (!existingPlan) {
        throw new ApiError(404, "Plan not found. Please contact support.");
      }

      if (!formData?.email || !formData?.billingAddress?.zipCode) {
        throw new ApiError(400, "Incomplete billing information.");
      }

      const discountAmount =
        existingPlan.yearlyPrice * (existingPlan.discount / 100);

      console.log(discountAmount);

      // ✅ Use real price from DB
      const actualAmount =
        plan.billing === "monthly"
          ? existingPlan.price
          : existingPlan.yearlyPrice - discountAmount;
      const taxAmount = actualAmount * (existingPlan.tax / 100);
      const totalAmount = actualAmount + taxAmount;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: formData.email,
        metadata: {
          userName: `${formData.firstName} ${formData.lastName}`,
          userId: userId,
          phone: formData.phone || "N/A",
          planName: existingPlan.name,
          billingCycle: plan.billing,
          zipCode: formData.billingAddress.zipCode,
          plan_id: existingPlan.id,
          plan_name: existingPlan.name,
          plan_price: existingPlan.price.toString(),
          plan_features: existingPlan.features.join(","),
        },
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `${existingPlan.name.toUpperCase()} (${plan.billing})`,
                description: existingPlan.description,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: "https://www.edulaunch.shop/?success=true",
        cancel_url: "https://www.edulaunch.shop/?cancelled=true",
      });

      res.status(200).json({ id: session.id });
    } catch (error: any) {
      console.error("Stripe Error:", error.message || error);
      res.status(error.statusCode || 500).json({
        error: error.message || "Something went wrong. Please try again.",
      });
    }
  }
);

// Use raw body for webhook

paymentRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new ApiError(400, "Webhook secret missing")

    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook verification failed:", err.message);
       res.status(400).send(`Webhook Error: ${err.message}`);
       return
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      

      console.log("✅ Payment Success");
      console.log("Email:", session.customer_email);
      console.log("Metadata:", session.metadata);

      if (!session.metadata) {
        throw new ApiError(400, "Metadata is missing");
      }

      // Define metadata structure
      interface CheckoutMetadata {
        plan_id: string;
        userId: string;
        billingCycle: string;
        planName?: string;
      }

      // Validate metadata
      const metadata = session.metadata as unknown;
      const isValidMetadata = (meta: unknown): meta is CheckoutMetadata =>
        meta !== null &&
        typeof meta === "object" &&
        "plan_id" in meta &&
        typeof (meta as any).plan_id === "string" &&
        "userId" in meta &&
        typeof (meta as any).userId === "string" &&
        "billingCycle" in meta &&
        typeof (meta as any).billingCycle === "string";

      if (!isValidMetadata(metadata)) {
        throw new ApiError(400, "Invalid metadata structure");
      }

      const { plan_id, userId, billingCycle } = metadata;

      try {
        const plan = await SubscriptionModel.findById(plan_id);
        if (!plan) throw new ApiError(400, "Plan not found");

        const user = await User.findById(userId);
        if (!user) throw new ApiError(400, "User not found");

        const currentDate = new Date();
        let newExpiryDate = new Date(currentDate);
        let remainingDays = 0;

        // 🧠 Check if user has an active subscription and same plan
        if (
          user.plan &&
          user.plan.toString() === plan.id.toString() &&
          user.subscriptionMeta?.isActive &&
          user.subscriptionMeta?.expiresDate &&
          user.subscriptionMeta.expiresDate > currentDate
        ) {
          // Same plan: Extend subscription with remaining days
          console.log("Extending existing subscription for user:", userId);
          const existingExpiry = new Date(user.subscriptionMeta.expiresDate);
          remainingDays = Math.max(
            0,
            Math.floor(
              (existingExpiry.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          console.log(`Remaining days: ${remainingDays}`);
        } else if (user.plan && user.plan.toString() !== plan.id.toString()) {
          // Different plan: Remove user from old plan's subscribers
          console.log("Overriding with new plan for user:", userId);
          const oldPlan = await SubscriptionModel.findById(user.plan);
          if (oldPlan) {
            oldPlan.subscribers = oldPlan.subscribers?.filter(
              (id) => id.toString() !== user._id.toString()
            );
            await oldPlan.save();
          }
        } else {
          console.log("Creating new subscription for user:", userId);
        }


        // 📅 Calculate new expiry
        if (billingCycle === "yearly") {
          newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        } else {
          newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        }

        // Add remaining days (only for same plan)
        if (remainingDays > 0) {
          newExpiryDate.setDate(newExpiryDate.getDate() + remainingDays);
        }

        // ✅ Update user
        user.plan = plan.id;
        user.role = Role.org_admin as any;
        user.subscriptionMeta = { //todo fix if payment was failed then dont add subscriptionMeta
          startDate: currentDate,
          expiresDate: newExpiryDate,
          isActive: true,
          isExpired: false,
        };

        // ✅ Add user to plan's subscribers if not already
        if (
          !plan.subscribers?.some((id) => id.toString() === user._id.toString())
        ) {
          plan.subscribers?.push(user._id);
          await plan.save();
        }

        await user.save();

        console.log("Updated subscriptionMeta:", user.subscriptionMeta);

         res.status(200).json({ received: true });
         return
      } catch (error: any) {
        console.error("❌ Webhook handling failed:", error.message);
        throw new ApiError(500, "Subscription update failed");
      }
    }

     res.status(200).send("Event received");
     return
  }
);

export default paymentRouter;
