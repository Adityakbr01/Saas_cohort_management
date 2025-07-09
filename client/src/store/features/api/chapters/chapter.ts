import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chapterApi = createApi({
  reducerPath: "chapterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/chapters`,
    credentials: "include", // Sends cookies with requests
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken"); // Adjust based on your auth setup
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Chapter"],
  endpoints: (builder) => ({
    myOrgCohorts: builder.query({
      query: () => ({
        url: `/myOrgCohorts`,
        method: "GET",
      }),
      providesTags: ["Chapter"],
    }),

    // create chapters
    createChapter: builder.mutation<any, any>({
      query: (formData) => {
        return {
          url: `/cohort/${formData.cohortId}`, // Relative to baseUrl (i.e., /cohorts/)
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Chapter"],
    }),
    deleteChapter: builder.mutation({
      query: (chapterId: string) => ({
        url: `/${chapterId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chapter"],
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
      providesTags: ["Chapter"],
    }),
    updateCohort: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chapter"],
    }),
  }),
});

export const {useCreateChapterMutation,useDeleteChapterMutation} = chapterApi;