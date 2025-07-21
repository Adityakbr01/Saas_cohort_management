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
  tax: number
  yearlyPrice: number
  discount: number
  maxStudents: number
  maxMentors: number
  maxCourses: number
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
  tagTypes: ["SubscriptionPlan"],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<GetSubscriptionsResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({
              type: "SubscriptionPlan" as const,
              id: _id,
            })),
            { type: "SubscriptionPlan", id: "LIST" },
          ]
          : [{ type: "SubscriptionPlan", id: "LIST" }],
    }),

    createSubscription: builder.mutation<
      SubscriptionPlan,
      Partial<SubscriptionPlan>
    >({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SubscriptionPlan", id: "LIST" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newSubscription } = await queryFulfilled;
          dispatch(
            subscriptionApi.util.updateQueryData(
              "getSubscriptions",
              undefined,
              (draft) => {
                draft.data.push(newSubscription);
              }
            )
          );
        } catch (error) {
          console.log(arg)
          console.error("Failed to create subscription:", error);
        }
      },
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
  invalidatesTags: (_result, _error, { id }) => [
    { type: "SubscriptionPlan", id },
    { type: "SubscriptionPlan", id: "LIST" },
  ],
}),

   deleteSubscription: builder.mutation<void, string>({
  query: (id) => ({
    url: `/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: (_result, _error, id) => [
    { type: "SubscriptionPlan", id },
    { type: "SubscriptionPlan", id: "LIST" },
  ],
}),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;
