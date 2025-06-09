// src/features/organization/orgApi.ts
import { apiSlice } from "@/store/features/api/apiSlice";
import type { Organization } from "@/types";

export const orgApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchOrganizations: builder.query<Organization[], void>({
      query: () => "/organizations",
      providesTags: ["Organization"],
    }),
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({
        url: "/organizations/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Organization"],
    }),
  }),
  overrideExisting: false,
});

export const { useFetchOrganizationsQuery, useCreateOrganizationMutation } = orgApi;
