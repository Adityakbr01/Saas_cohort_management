
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Backend_URL } from "@/config/constant";

interface Lesson {
  _id: string;
  title: string;
  shortDescription?: string;
  status: string;
  contentType: string;
  position: number;
  isPrivate?: boolean;
  videoUrl?: string;
}

interface Chapter {
  _id: string;
  title: string;
  shortDescription?: string;
  totalLessons: number;
  totalDuration: number;
  lessons: Lesson[];
  status: string;
}

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
  }),
});

export const { useAddVideoLessonMutation,useUpdateLessonMutation, useDeleteLessonMutation } = lessonApi;
