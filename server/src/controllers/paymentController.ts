// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { Request, Response } from "express";
// import mongoose from "mongoose";
// import { sendError, sendSuccess } from "@/utils/responseUtil";
// import { wrapAsync } from "@/utils/wrapAsync";
// import { SubscriptionModel } from "@/models/subscriptionModel"; // Adjust path to your Subscription model
// import { PaymentService } from "@/services/payment.service";
// import User from "@/models/userModel";

// // console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
// // console.log("Razorpay Key Secret:",process.env.RAZORPAY_KEY_SECRET);

// interface VerifyPaymentBody {
//   razorpay_payment_id: string;
//   razorpay_order_id: string;
//   razorpay_signature: string;
//   subscriptionId: string;
// }

// // Controller: Process Payment (Create Razorpay Order)
// export const processPayment = wrapAsync(async (req: Request, res: Response) => {
//   const { subscriptionId } = req.params;
//   const { currency = "INR" } = req.body;
//   const userId = req.user?.id;
//   const order = await PaymentService.processPayment(
//     subscriptionId,
//     currency,
//     userId
//   );
//   sendSuccess(res, 201, "Order created successfully", order);
// });

// // export const verifyPayment = wrapAsync(async (req: Request, res: Response) => {
// //   const {
// //     razorpay_payment_id,
// //     razorpay_order_id,
// //     razorpay_signature,
// //     subscriptionId,
// //   } = req.body as VerifyPaymentBody;

// //   // Validate input
// //   if (
// //     !razorpay_payment_id ||
// //     !razorpay_order_id ||
// //     !razorpay_signature ||
// //     !subscriptionId
// //   ) {
// //     sendError(res, 400, "Missing required field");
// //     return;
// //   }

// //   // Validate subscriptionId
// //   if (!mongoose.isValidObjectId(subscriptionId)) {
// //     sendSuccess(res, 400, "Invalid subscription ID");
// //     return;
// //   }

// //   // Verify signature
// //   const generatedSignature = crypto
// //     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
// //     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
// //     .digest("hex");

// //   if (generatedSignature !== razorpay_signature) {
// //     sendError(res, 400, "Invalid payment signature");
// //     return;
// //   }

// //   // Update subscription (e.g., add user to subscribers)
// //   const subscription = await SubscriptionModel.findById(subscriptionId);
// //   if (!subscription) {
// //     res.status(404).json({
// //       success: false,
// //       message: "Subscription not found",
// //     });
// //     return;
// //   }

// //   if (
// //     req.user &&
// //     !subscription?.subscribers?.includes(
// //       new mongoose.Types.ObjectId(req.user.id)
// //     )
// //   ) {
// //     subscription?.subscribers?.push(new mongoose.Types.ObjectId(req.user.id));

// //     User.findByIdAndUpdate(
// //       req.user.id,
// //         { $addToSet: { plan: subscriptionId } },
// //         { new: true }
// //     ).catch((err) => {
// //       console.error("Error updating user subscriptions:", err);
// //     }
// //     );

// //     await subscription.save();
// //   }

// //    sendSuccess(res, 200, "Payment verified successfully", {
// //     paymentId: razorpay_payment_id,
// //     orderId: razorpay_order_id,
// //     subscriptionId,
// //   });
// //   return
// // });

// export const verifyPayment = wrapAsync(async (req: Request, res: Response) => {
//   const response = await PaymentService.verifyPayment(req);
//   sendSuccess(res, 200, "Payment verified successfully", response);
// });

import { Request, Response } from "express";
import { wrapAsync } from "@/utils/wrapAsync";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { PaymentService } from "@/services/payment.service";
import razorpay from "@/lib/razorpay";
import { SubscriptionModel } from "@/models/subscriptionModel";
import mongoose, { mongo } from "mongoose";

// Controller: Process Payment (Create Razorpay Order)
export const processPayment = wrapAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { amount, currency = "INR" } = req.body; // Expect amount from frontend
  const userId = req.user?.id;

  if (!amount || amount < 100) {
    sendError(
      res,
      400,
      "Amount is required and must be at least ₹1 (100 paise)"
    );
    return;
  }

  const order = await PaymentService.processPayment(
    subscriptionId,
    amount,
    currency,
    userId
  );
  sendSuccess(res, 201, "Order created successfully", order);
});

// Controller: Verify Payment
export const verifyPayment = wrapAsync(async (req: Request, res: Response) => {
  const response = await PaymentService.verifyPayment(req);
  sendSuccess(res, 200, "Payment verified successfully", response);
});

// create payment
export const createPayment = wrapAsync(async (req: Request, res: Response) => {
  const { planId, currency } = req.body;


  // Step 1: Find the plan
  const plan = await SubscriptionModel.findById(planId);

  if (!plan || !plan.price) {
     res.status(404).json({ message: "Plan not found or price missing." });
     return
  }

  // Step 2: Create order in Razorpay
  const options = {
    amount: Number(plan.price) * 100, // Razorpay needs amount in paise
    currency: currency || "INR",
    receipt: `receipt_order_${planId}`,
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
     res.status(500).json({ message: "Failed to create Razorpay order." });
     return
  }

  // Step 3: Send response
   res.status(200).json({
    message: "Order created successfully",
    order,
  });
  return
});


//ValidatePayment
import crypto from "crypto";
export const ValidatePayment = wrapAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Step 1: Generate expected signature using secret key
  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex"); // ✅ typo fix: 'sha' not 'sh'

  // Step 2: Compare generated signature with received signature
  if (digest === razorpay_signature) {
     res.status(200).json({ message: "Payment verified successfully", success: true,orderId:razorpay_order_id,paymentId:razorpay_payment_id });
     return
  } else {
     res.status(400).json({ message: "Payment verification failed", success: false });
     return
  }
});




