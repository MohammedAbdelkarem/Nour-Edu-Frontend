// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const courseSlice = createApi({
  reducerPath: "courseSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/courses?c_level_id=${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/courses`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/courses/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/courses/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/courses/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changeType: builder.mutation({
      query: ({ id, price }) => ({
        url: `/courses/${id}/change-access-type-status${price ? `?price=${price}` : ''}`,
        method: "PATCH"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation,
               useChangeStatusMutation,
               useChangeTypeMutation } = courseSlice