
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Backend_URL } from "@/config/constant";
import type { CohortData } from "@/types/cohort";

export interface EnrolledCourse {
  cohortId: string;
  name: string;
  shortDescription: string;
  thumbnail: string;
  status: string;
  startDate: string;
  endDate: string;
  mentor: string | { name: string }; // <-- fix here
  organization: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  difficulty: string;
  rating: number;
  language: string;
}

export interface ProgressResponse {
  progress: {
    overall: number;
    byType: Record<string, number>;
    completedLessons: number;
    totalLessons: number;
    timeSpent: string;
    streakDays: string[];
    achievements: string[];
    xp: number;
    streak: string;
  };
}

export const enrolledApi = createApi({
  reducerPath: "enrolledApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/enrollment`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["EnrolledCourses"],
  endpoints: (builder) => ({
    getEnrolledCourses: builder.query<EnrolledCourse[], void>({
      query: () => "/enrolled-courses",
      transformResponse: (response: unknown) => {
        const data = response as { courses?: EnrolledCourse[]; data?: EnrolledCourse[] };
        return data.courses || data.data || [];
      },
      providesTags: ["EnrolledCourses"],
    }),
    getCohortDetail: builder.query<CohortData, string>({
      query: (cohortId) => `/cohorts/${cohortId}`,
      transformResponse: (response: unknown) => {
        if (typeof response === 'object' && response !== null && 'data' in response) {
          return (response as { data: CohortData }).data;
        }
        return response as CohortData;
      },
    }),
    markLessonComplete: builder.mutation<ProgressResponse, { cohortId: string; chapterId?: string; lessonId: string; timeSpent?: number }>({
      query: ({ cohortId, chapterId, lessonId, timeSpent }) => ({
        url: `/progress/lesson-complete`,
        method: "POST",
        body: { cohortId, chapterId, lessonId, timeSpent },
      }),
    }),
  }),
});

export const { useGetEnrolledCoursesQuery, useGetCohortDetailQuery,useMarkLessonCompleteMutation } = enrolledApi;
