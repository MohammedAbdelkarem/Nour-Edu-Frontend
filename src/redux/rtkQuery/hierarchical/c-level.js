// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const clevelSlice = createApi({
  reducerPath: "clevelSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/c-levels?e_level_id=${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/c-levels`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/c-levels/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/c-levels/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/c-levels/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation,
               useChangeStatusMutation } = clevelSlice