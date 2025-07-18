import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Response Type
export interface RazorpayOrderResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
    attempts: number;
    offer_id: string | null;
    notes: {
      subscriptionId: string;
      userId: string;
    };
  };
  timestamp: string;
}

export interface RequiredCredentialForVerifyPayment {
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_payment_id: string;
  subscriptionId: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/payments`,
    credentials: "include",
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    initiatePayment: builder.mutation({
      query: ({ subscriptionId, amount, currency }) => ({
        url: `/${subscriptionId}/payment`,
        method: "POST",
        body: { subscriptionId, amount, currency },
      }),
    }),

    verifyPayment: builder.mutation({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
    }),
    createPayment: builder.mutation({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body: body,
      }),
    }),
    validatePayment: builder.mutation({
      query: (body) => ({
        url: "/validate", // your backend endpoint
        method: "POST",
        body, // must contain razorpay_order_id, razorpay_payment_id, razorpay_signature
      }),
    }),
    create_checkout_session:builder.mutation({
      query:(body)=>({
        url:"/create-checkout-session",
        method: "POST",
        body,
      })
    }),
    create_checkout_session_cohort:builder.mutation({
      query:(body)=>({
        url:"/create-checkout-session-cohort",
        method: "POST",
        body,
      })
    })
  }),
});

export const {
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useCreatePaymentMutation,
  useValidatePaymentMutation,
  useCreate_checkout_sessionMutation,
  useCreate_checkout_session_cohortMutation
} = paymentApi;
