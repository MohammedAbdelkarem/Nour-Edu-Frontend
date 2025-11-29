// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const sellPointSlice = createApi({
  reducerPath: "sellPointSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ page }) => ({
        url: `/sell-points?per_page=10&page=${page}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/sell-points`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/sell-points/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/sell-points/${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useDeleteMutation, useUpdateMutation, useGetMutation, useCreateMutation } = sellPointSlice