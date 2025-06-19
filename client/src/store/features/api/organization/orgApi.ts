import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  ownerId: string;
  Members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MyOrgResponse {
  success: boolean;
  status: number;
  message: string;
  data: Organization;
  timestamp: string;
}

export interface InviteMentorRequest {
  email: string;
  name: string;
  phone: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: string; // Backend expects a comma-separated string, not an array
}

export interface InviteMentorResponse {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
}

export const orgApi = createApi({
  reducerPath: "orgApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/org`,
    credentials: "include", // sends cookies with requests
  }),
  tagTypes: ["Org"], // Add more tags if needed
  endpoints: (builder) => ({
    myOrg: builder.query<MyOrgResponse, void>({
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

    inviteMentors: builder.mutation<InviteMentorResponse, InviteMentorRequest>({
      query: (data: InviteMentorRequest) => ({
        url: `/invite`,
        method: "POST",
        body: data,
      }),
    }),
    pendingInvites: builder.query({
      query: (org_ownerId: string) => ({
        url: `/pending-invites/${org_ownerId}`,
        method: "GET",
      }),
    }),
    acceptInvite: builder.mutation({
      query: (token: string) => ({
        url: `/accept-invite?token=${token}`,
        method: "GET",
      }),
    }),
    finalizeInvite: builder.mutation({
      query: (inviteId: string) => ({
        url: `/approve-invite`,
        method: "POST",
        body: { inviteId },
      }),
    }),


  }),
});

export const { useMyOrgQuery, useCreateOrgMutation,useInviteMentorsMutation,usePendingInvitesQuery,useAcceptInviteMutation,useFinalizeInviteMutation } = orgApi;
