// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const unitSlice = createApi({
  reducerPath: "unitSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/units?subject_id=${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/units`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/units/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/units/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/units/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changeType: builder.mutation({
      query: ({ id, price }) => ({
        url: `/units/${id}/change-access-type-status${price ? `?price=${price}` : ''}`,
        method: "PATCH"
      })
    }),
    changePriority: builder.mutation({
      query: ({ body }) => ({
        url: `/units/change-priority`,
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
               useChangeTypeMutation,
               useChangePriorityMutation } = unitSlice