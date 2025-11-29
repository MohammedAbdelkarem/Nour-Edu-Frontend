// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const faqCategorySlice = createApi({
  reducerPath: "faqCategorySlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers, type }) => ({
        url: `/system/faq-category?per_page=100&app=${type}`,
        headers,
        method: "GET"
      })
    }),
    apps: builder.mutation({
      query: ({ headers }) => ({
        url: `/system/faq-category/apps`,
        headers,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/system/faq-category`,
        headers,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `/system/faq-category/${id}`,
        headers,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/system/faq-category/${id}`,
        headers,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useDeleteMutation,
               useStoreMutation,
               useUpdateMutation,
               useAppsMutation
              } = faqCategorySlice