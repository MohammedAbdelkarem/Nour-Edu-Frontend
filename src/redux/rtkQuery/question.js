// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const questionSlice = createApi({
  reducerPath: "questionSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getSingle: builder.mutation({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/questions`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/questions/${id}/update`,
        body,
        method: "POST"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useGetSingleMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation } = questionSlice