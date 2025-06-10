import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthResponse {
  token: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone_number: string;
      profileImage: string;
      OWN_Restaurant?: string;
    };
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:3000/api/v1/users`,
    credentials: "include",
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<
      AuthResponse,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    initiateRegisterUser: builder.mutation<
      AuthResponse,
      { name: string; email: string; password: string }
    >({
      query: (newUser) => ({
        url: "/register/initiate",
        method: "POST",
        body: newUser,
      }),
    }),
    complateRegisterUser: builder.mutation<
      AuthResponse,
      { otp: string; email: string; password: string }
    >({
      query: (newUser) => ({
        url: "/register/complete",
        method: "POST",
        body: newUser,
      }),
    }),
  }),
});

export const { useLoginUserMutation } = authApi;
