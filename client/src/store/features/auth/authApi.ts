import { Backend_URL } from "@/config/constant";
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

export interface LoginResponse {
  data: {
    result: {
      id: string;
      name: string;
      email: string;
      role: string;
      lastLogin: string;
      isVerified: boolean;
    };
    token: string;
    refreshToken: string;
  };
  success: boolean;
  message: string;
  status: number;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/users`,
    credentials: "include",
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<
      LoginResponse,
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
    resendUserOtp: builder.mutation<AuthResponse, { email: string }>({
      query: (email) => ({
        url: "/resend-otp",
        method: "POST",
        body: email,
      }),
    }),
    initiateForgotPassword: builder.mutation<AuthResponse, { email: string }>({
      query: (email) => ({
        url: "/initiate-forgot-password",
        method: "POST",
        body: email,
      }),
    }),
    complateForgotPassword: builder.mutation<
      AuthResponse,
      { otp: string; email: string; password: string }
    >({
      query: (forgotPasswordData) => ({
        url: "/complete-forgot-password",
        method: "POST",
        body: forgotPasswordData,
      }),
    }),
    resendForgotPasswordOtp: builder.mutation<AuthResponse, { email: string }>({
      query: (email) => ({
        url: "/resend-forgot-password-otp",
        method: "POST",
        body: email,
      }),
    }),

    getProfile: builder.query({
      query: () => "/profile",
    }),
  }),
});

export const {
  useLoginUserMutation,
  useInitiateRegisterUserMutation,
  useComplateRegisterUserMutation,
  useResendUserOtpMutation,
  useInitiateForgotPasswordMutation,
  useComplateForgotPasswordMutation,
  useResendForgotPasswordOtpMutation,
  useGetProfileQuery,
} = authApi;
