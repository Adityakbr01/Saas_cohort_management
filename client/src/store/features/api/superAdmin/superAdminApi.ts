// src/features/superAdmin/superAdminApi.ts
import { apiSlice } from "@/store/features/api/apiSlice";
import type { DashboardData } from "@/types";

export const superAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchSuperAdminDashboard: builder.query<DashboardData, void>({
      query: () => "/super_admin/dashboard",
      providesTags: ["SuperAdmin"],
    }),
  }),
  overrideExisting: false,
});

export const { useFetchSuperAdminDashboardQuery } = superAdminApi;
