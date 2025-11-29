// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const lessonSlice = createApi({
  reducerPath: "lessonSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/lessons?sub_unit_id=${id}`,
        method: "GET"
      })
    }),
    details: builder.mutation({
      query: ({ id }) => ({
        url: `/lessons/${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/lessons`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/lessons/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/lessons/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/lessons/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changePriority: builder.mutation({
      query: ({ body }) => ({
        url: `/lessons/change-priority`,
        body,
        method: "POST"
      })
    }),
    uploadVideo: builder.mutation({
      query: ({ body, id }) => ({
        url: `/lessons/${id}/upload-videos`,
        body,
        method: "POST"
      })
    }),
    deleteComment: builder.mutation({
      query: ({ id }) => ({
        url: `/lessons/comments/${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation,
               useChangeStatusMutation,
               useChangePriorityMutation,
               useUploadVideoMutation,
               useDetailsMutation,
               useDeleteCommentMutation } = lessonSlice