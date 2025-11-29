// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"

// ** Import URL
import baseQueryWithReauth from "../baseQuery"

export const categorySlice = createApi({
  reducerPath: "categorySlice",
  baseQuery: baseQueryWithReauth,
  tagTypes:['category'],
  endpoints: (builder) => ({
    get: builder.query({
      query: () => ({
        url: `/category`,
        method: "GET"
      }),
      providesTags:['category']
    }),
    store: builder.mutation({
      query: ({ body }) => ({
        url: `/category`,
        body,
        method: "POST"
      }),
      invalidatesTags:['category']
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/category/${id}`,
        body,
        method: "PUT"
      }),
      invalidatesTags:['category']
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/category/${id}`,
        method: "DELETE"
      }),
      invalidatesTags:['category']
    })
  })
})

export const { useGetQuery,
               useUpdateMutation,
               useStoreMutation,
               useDeleteMutation } = categorySlice