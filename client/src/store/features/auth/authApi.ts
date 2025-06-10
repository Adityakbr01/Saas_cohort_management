import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthResponse {
  token: string;
  message?: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string; 
    message?: string;
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
    resendUserOtp: builder.mutation<
      AuthResponse,
      { email: string }
    >({
      query: (email) => ({
        url: "/resend-otp",
        method: "POST",
        body: email,
      }),
    })
  }),
});

export const { useLoginUserMutation,useInitiateRegisterUserMutation,useComplateRegisterUserMutation,useResendUserOtpMutation } = authApi;
