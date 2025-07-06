import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface OrganizationMember {
  _id: string;
  user: string; // ya `User` agar populated hai to
  joinDate: string;
  suspended: {
    isSuspended: boolean;
    suspendedAt: string | null;
    reason: string;
  };
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  plan: string;
  Members: OrganizationMember[];
  createdAt: string;
  updatedAt: string;
}

export const mentorApi = createApi({
  reducerPath: "mentorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/mentors`,
    credentials: "include", // ✅ Sends cookies like refresh token
  }),
  tagTypes: ["Mentor", "myOrgMentors"], // ✅ Helpful for caching & invalidation
  endpoints: (builder) => ({
    getmyorg: builder.query<Organization[], void>({
      query: () => ({
        url: `/getmyorg`,
        method: "GET",
      }),
    }),
    myOrgCohorts: builder.query({
      // 📝 Gets cohorts for orgs where current user is a mentor
      query: () => ({
        url: `/myOrgCohorts`,
        method: "GET",
      }),
    }),
    createCohort: builder.mutation({
      // 📝 Creates new cohort (probably multipart/form-data)
      query: (formData: FormData) => ({
        url: `/`,
        method: "POST",
        body: formData,
      }),
    }),
    getmentorCohort: builder.query({
      query: () => ({
        url: `/getmentorCohorts`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetmyorgQuery,
  useMyOrgCohortsQuery,
  useCreateCohortMutation,
  useGetmentorCohortQuery,
} = mentorApi;
