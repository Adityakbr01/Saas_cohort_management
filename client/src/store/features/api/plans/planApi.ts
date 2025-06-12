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

export const plansApi = createApi({
  reducerPath: "plansApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/subscription`,
    credentials: "include",
  }),
  tagTypes: ["SubscriptionPlan"],
  endpoints: (builder) => ({
    getSubscriptionsPlan: builder.query<GetSubscriptionsResponse, void>({
  query: () => ({
    url: "/",
    method: "GET",
  }),
  providesTags: (result) =>
    result?.data
      ? [
          ...result.data.map(({ _id }) => ({
            type: "SubscriptionPlan" as const,
            id: _id,
          })),
          { type: "SubscriptionPlan", id: "LIST" },
        ]
      : [{ type: "SubscriptionPlan", id: "LIST" }],
})

  }),
});

export const { useGetSubscriptionsPlanQuery } = plansApi;
