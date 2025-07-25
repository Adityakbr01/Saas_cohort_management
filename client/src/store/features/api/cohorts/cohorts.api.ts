import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cohortsApi = createApi({
  reducerPath: "cohortsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/cohorts`,
    credentials: "include", // Sends cookies with requests
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken"); // Adjust based on your auth setup
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Cohort", "myOrgCohorts"],
  endpoints: (builder) => ({
    myOrgCohorts: builder.query({
      query: () => ({
        url: `/myOrgCohorts`,
        method: "GET",
      }),
      providesTags: ["myOrgCohorts"],
    }),
    createCohort: builder.mutation({
      query: (formData: FormData) => {
        return {
          url: `/`, // Relative to baseUrl (i.e., /cohorts/)
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["myOrgCohorts"],
    }),
    getCohortById: builder.query({
      query: (id: string) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
    getmentorCohort: builder.query({
      query: () => ({
        url: `/getmentorCohorts`,
        method: "GET",
      }),
      providesTags: ["myOrgCohorts"],
    }),
    updateCohort: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["myOrgCohorts"],
    }),
    getCohorts: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
    getCohortByCourseId: builder.query({
      query: (courseId: string) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
       providesTags: ["Cohort"],
    }),
    deleteCohort: builder.mutation({
      query: (cohortId: string) => ({
        url: `/${cohortId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["myOrgCohorts"],
    }),
    rateCohort: builder.mutation({
      query: ({ id, rating, review }) => ({
        url: `/${id}/rate`,
        method: "POST",
        body: { rating, review },
      }),
      invalidatesTags: ["Cohort"],
    }),
    unrateCohort: builder.mutation({
      query: (id: string) => ({
        url: `/${id}/rate`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cohort"],
    }),
    getRatingSummary: builder.query({
      query: (id: string) => ({
        url: `/${id}/rating-summary`,
        method: "GET",
      }),
      providesTags: ["Cohort"],
    }),
  }),
});

export const { useMyOrgCohortsQuery, useCreateCohortMutation,useGetCohortByIdQuery,useGetmentorCohortQuery,useUpdateCohortMutation,useGetCohortsQuery,useGetCohortByCourseIdQuery,useDeleteCohortMutation,useRateCohortMutation,useUnrateCohortMutation,useGetRatingSummaryQuery } = cohortsApi;