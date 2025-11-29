// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"

// ** Import URL
import baseQueryWithReauth from "../baseQuery"

export const contactSlice = createApi({
  reducerPath: "contactSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers }) => ({
        url: `/system/contact-us`,
        headers,
        method: "GET"
      })
    }),
    show: builder.mutation({
      query: ({ headers, lang }) => ({
        url: `/system/contact-us/${lang}`,
        headers,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/system/contact-us`,
        headers,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `/system/contact-us/${id}`,
        headers,
        body,
        method: "PUT"
      })
    }),
    delete: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/system/contact-us/${id}`,
        headers,
        method: "DELETE"
      })
    }),
    types: builder.query({
      query: ({ headers}) => ({
        url: `/system/contact-us/types`,
        headers,
        method: "GET"
      })
    })
  })
})

export const { useGetMutation,
               useShowMutation,
               useStoreMutation,
               useUpdateMutation,
               useDeleteMutation,
               useTypesQuery } = contactSlice