import { Role } from "@/configs/roleConfig";
import { Cohort } from "@/models/cohort.model";
import { CohortEnrollment } from "@/models/CohortEnrollment";
import Organization from "@/models/organization.model";
import Student from "@/models/student.model";
import { SubscriptionModel } from "@/models/subscriptionModel";
import User from "@/models/userModel";
import { stripe } from "@/routes/payment.Routes";
import { ApiError } from "@/utils/apiError";
import { logger } from "@/utils/logger";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import mongoose from "mongoose";
import Stripe from "stripe";

export const PaymentController = {
    createCheckoutSession: wrapAsync(async (req, res) => {
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
                success_url: "https://www.edulaunch.shop/",
                cancel_url: "https://www.edulaunch.shop/",
            });
            sendSuccess(res, 200, "", { id: session.id })
        } catch (error: any) {
            logger.info("Stripe Error:", error.message || error)
            throw new ApiError(error.statusCode || 500, error.message || "Something went wrong. Please try again.")
        }
    }),
    stripeWebhook: wrapAsync(async (req, res) => {

        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!endpointSecret) {
            throw new ApiError(400, "Webhook secret missing")

        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
        } catch (err: any) {
            logger.error("❌ Webhook verification failed:", err.message);
            throw new ApiError(400, "Webhook Error:")
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;



            logger.info("✅ Payment Success")
            logger.info("Email:", session.customer_email)
            logger.info("Metadata:", session.metadata);

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

                let user;
                if (userId) {
                    user = await Organization.findById(userId);
                }
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
                    logger.info("Remaining days:", remainingDays);
                } else if (user.plan && user.plan.toString() !== plan.id.toString()) {
                    // Different plan: Remove user from old plan's subscribers
                    logger.info("Overriding with new plan for user:", userId);
                    const oldPlan = await SubscriptionModel.findById(user.plan);
                    if (oldPlan) {
                        oldPlan.subscribers = oldPlan.subscribers?.filter(
                            (id) => id.toString() !== user._id.toString()
                        );
                        await oldPlan.save();
                    }
                } else {
                    logger.info("Creating new subscription for user:", userId);
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
                    maxStudents: plan.maxStudents,
                    maxMentors: plan.maxMentors,
                    maxCourses: plan.maxCourses,
                };

                // ✅ Add user to plan's subscribers if not already
                if (
                    !plan.subscribers?.some((id) => id.toString() === user._id.toString())
                ) {
                    plan.subscribers?.push(user._id);
                    await plan.save();
                }

                await user.save();

                logger.info("Updated subscriptionMeta:", user.subscriptionMeta)
                sendSuccess(res, 200, "success", { received: true })
                return
            } catch (error: any) {
                logger.error("❌ Webhook handling failed:", error.message);
                throw new ApiError(500, "Subscription update failed");
            }
        }
        res.status(200).send("Event received");
        return
    }),
    createCheckoutSessionCohort: wrapAsync(async (req, res) => {
        try {
            const { cohortId, currency = "INR", formData } = req.body;
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
            sendSuccess(res, 200, "success", { id: session.id })
        } catch (error: any) {
            logger.info("Stripe Error:", error.message || error)
            throw new ApiError(error.statusCode || 500, error.message || "Something went wrong. Please try again.")
        }
    }),
    stripeWebhookEnrollment: wrapAsync(async (req, res) => {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_COHORT;

        if (!endpointSecret) {
            logger.error("❌ STRIPE_WEBHOOK_SECRET_COHORT missing");
            throw new ApiError(500, "Webhook secret missing")
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
        } catch (err: any) {
            logger.error("❌ Webhook signature verification failed:", err.message);
            throw new ApiError(400, `Webhook Error: ${err.message}`)
        }

        logger.info(`📩 Received Stripe event: ${event.type}`);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const cohortId = session.metadata?.cohort_id;

            if (!userId || !cohortId) {
                logger.error("❌ Missing metadata: userId or cohortId");
                throw new ApiError(400, "Metadata missing")
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
                    logger.info("ℹ️ User already enrolled. Skipping duplicate.");
                    sendSuccess(res, 200, "Already enrolled", null)
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
                                paymentAmount: session?.amount_total ? Math.round(session.amount_total / 100) : 0,
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

                    logger.info("🎉 User enrolled successfully in cohort:", userId);
                    sendSuccess(res, 200, "Enrollment successful 🎉", null)
                    return
                } catch (txErr: any) {
                    await sessionDb.abortTransaction();
                    sessionDb.endSession();
                    logger.error("❌ Transaction failed:", txErr.message);
                    throw new ApiError(500, "Enrollment transaction failed")
                    return
                }
            } catch (dbError: any) {
                logger.error("❌ DB Error during enrollment:", dbError.message);
                throw new ApiError(500, "Error while enrolling user")
            }
        }
        sendSuccess(res, 200, "Event received", null)
        return

    })
}