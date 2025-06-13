// routes/paymentRouter.js
import express from "express";
import Stripe from "stripe";
import { z } from "zod";

// import { processPayment, verifyPayment } from "@/controllers/paymentController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import {
  createPayment,
  processPayment,
  ValidatePayment,
  verifyPayment,
} from "@/controllers/paymentController";
import { ApiError } from "@/utils/apiError";

import { validateRequest } from "@/middleware/validateRequest";
import { SubscriptionModel } from "@/models/subscriptionModel";

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
paymentRouter.post("/:subscriptionId/payment", protect, processPayment);

// Payment verification route
paymentRouter.post(
  "/verify",
  validateRequest(paymentSchema),
  protect,
  verifyPayment
);

paymentRouter.post("/create", createPayment);
paymentRouter.post("/validate", ValidatePayment);

paymentRouter.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, currency = "INR", formData } = req.body.plan;

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
        phone: formData.phone || "N/A",
        planName: existingPlan.name,
        billingCycle: plan.billing,
        zipCode: formData.billingAddress.zipCode,
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
      success_url: "http://localhost:5173/profile?success=true",
      cancel_url: "http://localhost:5173/subscription?cancelled=true",
    });

    res.status(200).json({ id: session.id });
  } catch (error: any) {
    console.error("Stripe Error:", error.message || error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Something went wrong. Please try again.",
    });
  }
});

export default paymentRouter;
