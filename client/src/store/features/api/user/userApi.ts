
import { apiSlice } from "@/store/features/api/apiSlice";
import type { User } from "@/types";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    updateUserRole: builder.mutation<{ success: boolean }, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useFetchUsersQuery, useUpdateUserRoleMutation } = userApi;
