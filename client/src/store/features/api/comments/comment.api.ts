import { Backend_URL } from "@/config/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ======================
// ✅ Types
// ======================
interface Comment {
  _id: string;
  author: {
    name: string;
    avatar: string;
    role: "student" | "mentor"; // Adjust roles as per backend
    _id: string; // Added for author identification
    
  };
  createdAt:string
  content: string;
  timestamp: string;
  likes: string[]; // Array of user IDs who liked the comment
  dislikes: string[]; // Array of user IDs who liked the comment;
  isPinned: boolean;
  replies: Comment[];
  userReaction?: "like" | "dislike" | null;
  id?: string; // Optional for replies
}

// ======================
// ✅ API
// ======================
export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/comments`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    // ✅ Get all comments for a lesson
    getComments: builder.query<Comment[], string>({
      query: (lessonId) => ({
        url: `/lesson/${lessonId}`,
        method: "GET",
      }),
      providesTags: ["Comment"],
    }),

    // ✅ Add new comment to a lesson
    addComment: builder.mutation<Comment, { lessonId: string; content: string }>({
      query: ({ lessonId, content }) => ({
        url: `/`,
        method: "POST",
        body: { lessonId, content },
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Add reply to a specific comment
    addReply: builder.mutation<Comment, { commentId: string; content: string }>({
      query: ({ commentId, content }) => ({
        url: `/${commentId}/reply`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Like comment
    toggleLike: builder.mutation<Comment, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Dislike comment
    toggleDislike: builder.mutation<Comment, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/${commentId}/dislike`,
        method: "POST",
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Pin/Unpin comment
    togglePin: builder.mutation<Comment, { commentId: string; isPinned: boolean }>({
      query: ({ commentId, isPinned }) => ({
        url: `/${commentId}/pin`,
        method: "POST",
        body: { isPinned },
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Edit comment
    editComment: builder.mutation<Comment, { commentId: string; content: string }>({
      query: ({ commentId, content }) => ({
        url: `/${commentId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Delete comment
    deleteComment: builder.mutation<{ message: string }, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),

    // ✅ Delete reply
    deleteReply: builder.mutation<{ message: string }, { commentId: string; replyId: string }>({
      query: ({ commentId, replyId }) => ({
        url: `/${commentId}/reply/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
  }),
});



// ======================
// ✅ Export Hooks
// ======================
export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useAddReplyMutation,
  useToggleLikeMutation,
  useToggleDislikeMutation,
  useTogglePinMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} = commentApi;
