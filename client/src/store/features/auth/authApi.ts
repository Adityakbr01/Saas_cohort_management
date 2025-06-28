import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUser } from "../slice/UserAuthSlice";

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
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      lastLogin: string;
      isVerified: boolean;
    };
    token?: string;
    refreshToken?: string;
    accessToken?: string;
  };
  success: boolean;
  message: string;
  status: number;
}

export interface RegisterResponse {
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

export interface RegisterBody {
  email: string;
  password: string;
  role: "mentor" | "student" | "organization" | "super_admin";
  name: string;
  phone?: string;
  slug?: string;
  specialization?: string;
  experience?: string;
  yearsOfExperience?: number;
  skillsExpertise?: string[];
  adminPrivileges?: string[];
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/auth`,
    credentials: "include",
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    loginUserOld: builder.mutation<
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

    getProfile2: builder.query({
      query: () => "/profile",
    }),

    //New Apis
    registerUser: builder.mutation<RegisterResponse, RegisterBody>({
      query: (newUser) => ({
        url: "/register",
        method: "POST",
        body: newUser,
      }),
    }),
    verifyEmail: builder.mutation<
      AuthResponse,
      { email: string; otp: string; role: string }
    >({
      query: (verifyData) => ({
        url: "/verify-email",
        method: "POST",
        body: verifyData,
      }),
    }),
    loginUser: builder.mutation<
      LoginResponse,
      { email: string; password: string; role: string }
    >({
      query: (loginData) => ({
        url: "/login",
        method: "POST",
        body: loginData,
      }),
    }),
    forgotPassword: builder.mutation<
      {
        status: string;
        message: string;
      },
      { email: string; role: string }
    >({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        body: email,
      }),
    }),
    forgotPasswordVerify: builder.mutation<
      { status: string; message: string },
      { email: string; role: string; password: string; otp: string }
    >({
      query: ({ email, role, password, otp }) => ({
        url: "/forgot-password/verify",
        method: "POST",
        body: { email, role, password, otp },
      }),
    }),
    resendForgotPasswordOTP: builder.mutation<
      AuthResponse,
      { email: string; role: string }
    >({
      query: (email) => ({
        url: "/forgot-password/resend",
        method: "POST",
        body: email,
      }),
    }),
    refreshToken: builder.mutation<
      { data: { accessToken: string } },
      { refreshToken: string }
    >({
      query: ({ refreshToken }) => ({
        url: "/refresh-token",
        method: "POST",
        body: { refreshToken: refreshToken },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/getProfile",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data)); // 👈 Set user in Redux store
        } catch (error) {
          console.error("Failed to get profile:", error);
        }
      },
    }),
    updateProfile: builder.mutation<void, FormData>({
      query: (updateData) => ({
        url: "/updateProfile",
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: ["Profile"],
    }),
    resetPassword: builder.mutation<{ password: string }, { password: string }>(
      {
        query: (password) => ({
          url: "/password/reset",
          method: "POST",
          body: password,
        }),
      }
    ),
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
  useRegisterUserMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useForgotPasswordVerifyMutation,
  useResendForgotPasswordOTPMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useResetPasswordMutation,
} = authApi;
