// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const faqSlice = createApi({
  reducerPath: "faqSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/system/faq-category/${id}`,
        headers,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/system/faq`,
        headers,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `/system/faq/${id}`,
        headers,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/system/faq/${id}`,
        headers,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useUpdateMutation,
               useStoreMutation,
               useDeleteMutation } = faqSlice