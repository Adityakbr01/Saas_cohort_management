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

// Controller: Process Payment (Create Razorpay Order)
export const processPayment = wrapAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { amount, currency = "INR" } = req.body; // Expect amount from frontend
  const userId = req.user?.id;

  if (!amount || amount < 100) {
     sendError(res, 400, "Amount is required and must be at least ₹1 (100 paise)");
     return
  }

  const order = await PaymentService.processPayment(subscriptionId, amount, currency, userId);
  sendSuccess(res, 201, "Order created successfully", order);
});

// Controller: Verify Payment
export const verifyPayment = wrapAsync(async (req: Request, res: Response) => {
  const response = await PaymentService.verifyPayment(req);
  sendSuccess(res, 200, "Payment verified successfully", response);
});