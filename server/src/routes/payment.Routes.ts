import { protect } from "@/middleware/authMiddleware";
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import { z } from "zod";
import { ApiError } from "@/utils/apiError";
import { PaymentController } from "../controllers/paymentcontroller";
import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

dotenv.config();

export const paymentSchema = z.object({
  razorpay_payment_id: z.string().nonempty("Payment ID is required"),
  razorpay_order_id: z.string().nonempty("Order ID is required"),
  razorpay_signature: z.string().nonempty("Signature is required"),
  subscriptionId: z.string().nonempty("Subscription ID is required"),
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new ApiError(500, "Key Not Defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentRouter = express.Router();

// ------------------- Rate Limiters ------------------- //
const createCheckoutLimiter = createDynamicRateLimiter({ maxRequests: 5, timeWindow: 10 }); // 5 req / 10 min
const webhookLimiter = createDynamicRateLimiter({ maxRequests: 20, timeWindow: 10 }); // 20 req / 10 min
// ----------------------------------------------------- //

// Payment Route for Stripe ---------------------------------------------------------------

// Organization subscription
paymentRouter.post(
  "/create-checkout-session",
  protect,
  createCheckoutLimiter,
  express.json({ limit: "24kb" }),
  PaymentController.createCheckoutSession
);

// Stripe webhook for organization subscription
paymentRouter.post(
  "/stripe/webhook",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);

// Course enrollment
paymentRouter.post(
  "/create-checkout-session-cohort",
  protect,
  createCheckoutLimiter,
  express.json({ limit: "24kb" }),
  PaymentController.createCheckoutSessionCohort
);

// Stripe webhook for course enrollment
paymentRouter.post(
  "/stripe/webhook/enrollment",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhookEnrollment
);

export default paymentRouter;
