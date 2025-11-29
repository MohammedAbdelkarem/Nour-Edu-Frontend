// serviceSlice.js
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const serviceSlice = createApi({
  reducerPath: "serviceSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    list: builder.mutation({
      query: ({filterOptions}) => ({
        url: `/customer-cards?${filterOptions}`,
        method: "GET"
      })
    }),
    show: builder.mutation({
      query: ({id}) => ({
        url: `/customer-cards/${id}`,
        method: "GET"
      })
    }),
    delete: builder.mutation({
      query: ({id}) => ({
        url: `/customer-cards/${id}`,
        method: "DELETE"
      })
    }),
    close: builder.mutation({
      query: ({body}) => ({
        url: `/customer-cards/close`,
        body,
        method: "POST"
      })
    }),
    types: builder.query({
      query: () => ({
        url: `/customer-cards/types-status`,
        method: "GET"
      })
    })
  })
})

export const { useListMutation, useShowMutation, useDeleteMutation, useCloseMutation, useTypesQuery } = serviceSlice