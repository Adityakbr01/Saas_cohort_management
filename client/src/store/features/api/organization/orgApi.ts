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
  tagTypes: ["Org","myOrgMentors"], // Add more tags if needed
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
    resendInvite: builder.mutation({
      query: (inviteId: string) => ({
        url: `/resend-invite?inviteId=${inviteId}`,
        method: "GET",
      }),
    }),
    cancelInvite: builder.mutation({
      query: (inviteId: string) => ({
        url: `/cencel-invite`,
        method: "POST",
        body: { inviteId },
      }),
    }),
    deleteMentor: builder.mutation({
      query: (mentorId: string) => ({
        url: `/delete-Mentor`,
        method: "DELETE",
        body: { mentorId },
      }),
      invalidatesTags: ["myOrgMentors"],
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
       invalidatesTags: ["myOrgMentors"],
    }),
    finalizeInvite: builder.mutation({
      query: (inviteId: string) => ({
        url: `/approve-invite`,
        method: "POST",
        body: { inviteId },
      }),
       invalidatesTags: ["myOrgMentors"],
    }),
    getOrgMentors: builder.query({
      query: () => ({
        url: `/getOrgMentors`,
        method: "GET",
      }),
      providesTags: ["myOrgMentors"],
    }),


  }),
});

export const { useMyOrgQuery, useCreateOrgMutation,useInviteMentorsMutation,useResendInviteMutation,useCancelInviteMutation,useDeleteMentorMutation,usePendingInvitesQuery,useAcceptInviteMutation,useFinalizeInviteMutation,useGetOrgMentorsQuery } = orgApi;
