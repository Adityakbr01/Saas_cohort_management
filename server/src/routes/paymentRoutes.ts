// routes/paymentRouter.js
import express from "express";
import Stripe from "stripe";
import { z } from "zod";

// import { processPayment, verifyPayment } from "@/controllers/paymentController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { createPayment, processPayment, ValidatePayment, verifyPayment } from "@/controllers/paymentController";
import { ApiError } from "@/utils/apiError";

import { validateRequest } from "@/middleware/validateRequest";


export const paymentSchema = z.object({
  razorpay_payment_id: z.string().nonempty("Payment ID is required"),
  razorpay_order_id: z.string().nonempty("Order ID is required"),
  razorpay_signature: z.string().nonempty("Signature is required"),
  subscriptionId: z.string().nonempty("Subscription ID is required"),
});


if(!process.env.STRIPE_SECRET_KEY){
  throw new ApiError(500,"Key Not Defin")
}



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const paymentRouter = express.Router();



// Payment routes

//payment create order with razorpay
paymentRouter.post("/:subscriptionId/payment", protect, processPayment);

// Payment verification route
paymentRouter.post("/verify",validateRequest(paymentSchema), protect, verifyPayment);

paymentRouter.post("/create",createPayment)
paymentRouter.post("/validate",ValidatePayment)

paymentRouter.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, currency } = req.body.plan || req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency || "INR",
            product_data: {
              name: "Custom Plan", // Replace with dynamic value if needed
            },
            unit_amount: amount * 100, // Stripe expects amount in paise (for INR)
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/profile", // ✅ Update with your frontend success URL
      cancel_url: "http://localhost:5173/subscription",   // ✅ Update with your frontend cancel URL
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
})


export default paymentRouter;
