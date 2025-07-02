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
  }),
});

export const { useMyOrgCohortsQuery, useCreateCohortMutation } = cohortsApi;