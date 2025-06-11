import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type SubscriptionPlan = {
  _id: string;
  name: "basic" | "pro" | "business";
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  subscribers: string[]; // Or User[] if you're populating users
  Owner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface GetSubscriptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: SubscriptionPlan[];
  timestamp: string;
}

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/subscription`,
    credentials: "include",
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<GetSubscriptionsResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
    }),
    updateSubscription: builder.mutation<
      void,
      { id: string; data: Partial<SubscriptionPlan> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const { useGetSubscriptionsQuery,useUpdateSubscriptionMutation } = subscriptionApi;
