import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orgApi = createApi({
  reducerPath: "orgApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/org`,
    credentials: "include", // sends cookies with requests
  }),
  tagTypes: ["Org"], // Add more tags if needed
  endpoints: (builder) => ({
    myOrg: builder.query<any, void>({
      query: () => ({
        url: `/myOrg`,
        method: "GET", // 🟡 POST is uncommon for fetching data
      }),
    }),
    createOrg: builder.mutation({
      query: (formData: FormData) => ({
        url: `/create`,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useMyOrgQuery,useCreateOrgMutation } = orgApi;
