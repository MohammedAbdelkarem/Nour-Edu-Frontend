// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const subUnitSlice = createApi({
  reducerPath: "subUnitSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/sub-units?unit_id=${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/sub-units`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/sub-units/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/sub-units/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sub-units/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    changeType: builder.mutation({
      query: ({ id, price }) => ({
        url: `/sub-units/${id}/change-access-type-status${price ? `?price=${price}` : ''}`,
        method: "PATCH"
      })
    }),
    changePriority: builder.mutation({
      query: ({ body }) => ({
        url: `/sub-units/change-priority`,
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
               useChangePriorityMutation } = subUnitSlice