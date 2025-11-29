// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const fileSlice = createApi({
  reducerPath: "fileSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ page, per_page, context_id, context_type }) => ({
        url: `/files?page=${page}&per_page=${per_page}&context_id=${context_id}&context_type=${context_type}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/files`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/files/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/files/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/files/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changePriority: builder.mutation({
      query: ({ body}) => ({
        url: `/files/change-priority`,
        body,
        method: "POST"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation,
               useChangeStatusMutation,
               useChangePriorityMutation} = fileSlice