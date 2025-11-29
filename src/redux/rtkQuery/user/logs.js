// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ** Import URL
import { admin_url } from "../../../constant/url"

export const logSlice = createApi({
  reducerPath: "logSlice",
  baseQuery: fetchBaseQuery({ baseUrl: admin_url }),
  endpoints: (builder) => ({
    all: builder.mutation({
      query: ({ headers, filterOptions}) => ({
        url: `/logs/bans-log?${filterOptions}`,
        headers,
        method: "GET"
      })
    }),
    user: builder.mutation({
      query: ({ headers, id, page, perPage }) => ({
        url: `/logs/bans-log?id=${id}&page=${page}&per_page=${perPage}`,
        headers,
        method: "GET"
      })
    }),
    show: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/logs/bans-log/${id}`,
        headers,
        method: "GET"
      })
    }), 
    loginHistory: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/profile/login-history/${id}`,
        headers,
        method: "GET"
      })
    })
  })
})

export const { useAllMutation, useShowMutation, useUserMutation, useLoginHistoryMutation } = logSlice