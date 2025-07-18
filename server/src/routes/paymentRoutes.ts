// routes/paymentRouter.js
import { protect } from "@/middleware/authMiddleware";
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import { z } from "zod";
dotenv.config();

import { ApiError } from "@/utils/apiError";

import { Role } from "@/configs/roleConfig";
import { SubscriptionModel } from "@/models/subscriptionModel";
import User from "@/models/userModel";
import { Cohort } from "@/models/cohort.model";
import { CohortEnrollment } from "@/models/CohortEnrollment";
import Student from "@/models/student.model";
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


//Payment Route for stripe ---------------------------------------------------------------

// Org subscription
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
//Org subscription webhook
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

//--------------------------------------------------------------//

//Course enrollement
paymentRouter.post("/create-checkout-session-cohort", protect, express.json({ limit: "24kb" }), async (req, res) => {
  try {
    const { cohortId, currency = "INR", formData } = req.body;
    console.log(req.body)
    const userId = req.user.id;

    if (!cohortId) {
      throw new ApiError(400, "Cohort ID is required.");
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      throw new ApiError(404, "Cohort not found.");
    }

    if (!formData?.email || !formData?.billingAddress?.zipCode) {
      throw new ApiError(400, "Incomplete billing information.");
    }

    const totalAmount = cohort.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: formData.email,
      metadata: {
        userName: `${formData.firstName} ${formData.lastName}`,
        userId: userId,
        phone: formData.phone || "N/A",
        cohortName: cohort.title,
        zipCode: formData.billingAddress.zipCode,
        cohort_id: cohort.id,
        cohort_name: cohort.title,
        cohort_price: cohort.price.toString(),
        cohort_description: cohort.description,
      },
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${cohort.title}`,
              description: cohort.description,
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

//Course enrollement webhook

paymentRouter.post(
  "/stripe/webhook/enrollment",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_COHORT;

    if (!endpointSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET_COHORT missing");
       res.status(500).send("Webhook secret missing");
       return
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
       res.status(400).send(`Webhook Error: ${err.message}`);
       return
    }

    console.log(`📩 Received Stripe event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const cohortId = session.metadata?.cohort_id;

      if (!userId || !cohortId) {
        console.error("❌ Missing metadata: userId or cohortId");
         res.status(400).send("Metadata missing");
         return
      }

      const sessionId = session.id;

      try {
        const alreadyEnrolled = await CohortEnrollment.findOne({
          user: userId,
          cohort: cohortId,
          isPaid: true,
          paymentMethod: "stripe",
        });

        if (alreadyEnrolled) {
          console.log("ℹ️ User already enrolled. Skipping duplicate.");
           res.status(200).send("Already enrolled");
           return
        }

        const sessionDb = await mongoose.startSession();
        sessionDb.startTransaction();

        try {
          await CohortEnrollment.create(
            [
              {
                user: userId,
                cohort: cohortId,
                isPaid: true,
                paymentMethod: "stripe",
                paymentId: sessionId,
                paymentAmount: session?.amount_total && session.amount_total / 100,
                paymentDate: new Date(),
                paymentStatus: "paid",
                paymentDetails: session,
              },
            ],
            { session: sessionDb }
          );

          await Cohort.findByIdAndUpdate(
            cohortId,
            { $addToSet: { students: userId } },
            { session: sessionDb }
          );

          await User.findByIdAndUpdate(
            userId,
            { $addToSet: { cohorts: cohortId } },
            { session: sessionDb }
          );

          await Student.findByIdAndUpdate(
            userId,
            {
              $addToSet: {
                cohorts: cohortId,
                enrolledCourses: cohortId,
              },
            },
            { session: sessionDb }
          );

          await sessionDb.commitTransaction();
          sessionDb.endSession();

          console.log("🎉 User enrolled successfully in cohort:", userId);
           res.status(200).send("Enrollment successful 🎉");
           return
        } catch (txErr: any) {
          await sessionDb.abortTransaction();
          sessionDb.endSession();
          console.error("❌ Transaction failed:", txErr.message);
           res.status(500).send("Enrollment transaction failed");
           return
        }
      } catch (dbError: any) {
        console.error("❌ DB Error during enrollment:", dbError.message);
         res.status(500).send("Error while enrolling user");
         return
      }
    }

     res.status(200).send("Event received");
     return
  }
);




export default paymentRouter;
