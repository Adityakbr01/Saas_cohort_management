// routes/paymentRouter.js
import express from "express";
// import { processPayment, verifyPayment } from "@/controllers/paymentController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { processPayment, verifyPayment } from "@/controllers/paymentController";

import { z } from "zod";
import { validateRequest } from "@/middleware/validateRequest";

// Define Zod schema for request validation

// import { z } from "zod";

export const paymentSchema = z.object({
  razorpay_payment_id: z.string().nonempty("Payment ID is required"),
  razorpay_order_id: z.string().nonempty("Order ID is required"),
  razorpay_signature: z.string().nonempty("Signature is required"),
  subscriptionId: z.string().nonempty("Subscription ID is required"),
});


const paymentRouter = express.Router();



// Payment routes

//payment create order with razorpay
paymentRouter.post("/:subscriptionId/payment", protect, processPayment);

// Payment verification route
paymentRouter.post("/verify",validateRequest(paymentSchema), protect, verifyPayment);

export default paymentRouter;
