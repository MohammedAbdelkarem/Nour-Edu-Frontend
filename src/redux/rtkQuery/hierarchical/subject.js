// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const subjectSlice = createApi({
  reducerPath: "subjectSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/subjects?course_id=${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/subjects`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/subjects/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/subjects/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/subjects/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changeType: builder.mutation({
      query: ({ id, price }) => ({
        url: `/subjects/${id}/change-access-type-status${price ? `?price=${price}` : ''}`,
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
               useChangeTypeMutation } = subjectSlice