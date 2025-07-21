
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Backend_URL } from "@/config/constant";
import type { Lesson } from "@/types";




export interface AddLectureResponse {
  success: boolean;
  status: number;
  message: string;
  data: Lesson;
  timestamp: string;
}


export const lessonApi = createApi({
  reducerPath: "lessonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/lessons`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Chapter", "Lesson"],
  endpoints: (builder) => ({
    addVideoLesson: builder.mutation<
      AddLectureResponse,
      {
        chapterId: string;
        lesson: {
          title: string;
          shortDescription?: string;
          contentType: string;
          status: string;
          isPrivate?: boolean;
          video: File;
        };
      }
    >({
      query: ({ chapterId, lesson }) => {
        const formData = new FormData();
        formData.append("video", lesson.video);
        formData.append("title", lesson.title);
        if (lesson.shortDescription) formData.append("shortDescription", lesson.shortDescription);
        formData.append("contentType", lesson.contentType);
        formData.append("status", lesson.status);
        if (lesson.isPrivate) formData.append("isPrivate", lesson.isPrivate.toString());
        return {
          url: `/${chapterId}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Chapter", "Lesson"],
    }),
    updateLesson: builder.mutation({
      query: ({ lessonId, updates }) => ({
        url: `/${lessonId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Chapter", "Lesson"],
    }),
    deleteLesson: builder.mutation({
      query: (lessonId: string) => ({
        url: `/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chapter", "Lesson"],
    }),
    uploadCode: builder.mutation({
      query: ({ lessonId, code }) => ({
        url: `/${lessonId}/uploadCode`,
        method: "POST",
        body: code,
      }),
      invalidatesTags: ["Chapter", "Lesson"],
    }),
    uploadResource: builder.mutation({
      query: ({ lessonId, resource }) => ({
        url: `/${lessonId}/uploadResource`,
        method: "POST",
        body: resource,
      }),
    }),
    getLessonCodeExamples: builder.query({
      query: (lessonId: string) => ({
        url: `/${lessonId}/code-examples`,
        method: "GET",
      }),
      providesTags: ["Lesson"],
    }),
    getLessonResources: builder.query({
      query: (lessonId: string) => ({
        url: `/${lessonId}/resources`,
        method: "GET",
      }),
      providesTags: ["Lesson"],
    }),
    updateCodeExample: builder.mutation({
      query: ({ codeId, updates }) => ({
        url: `/code-example/${codeId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Lesson"],
    }),
    deleteCodeExample: builder.mutation({
      query: (codeId: string) => ({
        url: `/code-example/${codeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lesson"],
    }),
    updateResource: builder.mutation({
      query: ({ resourceId, updates }) => ({
        url: `/resource/${resourceId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Lesson"],
    }),
    deleteResource: builder.mutation({
      query: (resourceId: string) => ({
        url: `/resource/${resourceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lesson"],
    }),
  }),
});

export const { useAddVideoLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation, useUploadCodeMutation, useUploadResourceMutation, useGetLessonCodeExamplesQuery, useGetLessonResourcesQuery, useUpdateCodeExampleMutation, useDeleteCodeExampleMutation, useUpdateResourceMutation, useDeleteResourceMutation } = lessonApi;
