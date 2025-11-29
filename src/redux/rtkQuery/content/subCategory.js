// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"

// ** Import URL
import baseQueryWithReauth from "../baseQuery"

export const subCategorySlice = createApi({
  reducerPath: "subCategorySlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ id }) => ({
        url: `/sub_category/getBycategories?category_ids[]=${id}`,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ body }) => ({
        url: `/sub_category`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/sub_category/${id}`,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/sub_category/${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useUpdateMutation,
               useStoreMutation,
               useDeleteMutation } = subCategorySlice