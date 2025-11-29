// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ** Import URL
import { admin_url } from "../../constant/url"

export const authSlice = createApi({
  reducerPath: "authSlice",
  tagTypes: ["auth"],
  baseQuery: fetchBaseQuery({ baseUrl: admin_url }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ body }) => ({
        url: `/login`,
        body,
        method: "POST"
      })
    }),
    logout: builder.mutation({
      query: ({ headers }) => ({
        url: `/logout`,
        headers,
        method: "POST"
      })
    }),
    activeSessions: builder.query({
      query: ({headers}) => ({
        url: `/active-session`,
        headers,
        method: "GET"
      }),
      providesTags: ["auth"]
    }),
    logoutAll: builder.mutation({
      query: ({ headers }) => ({
        url: `/logout-all`,
        headers,
        method: "Get"
      }),
      invalidatesTags: ["auth"]
    }),
    logoutSessions: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/logout-session`,
        headers,
        body,
        method: "POST"
      }),
      invalidatesTags: ["auth"]
    }),
    refresh: builder.mutation({
      query: ({ headers }) => ({
        url: `/refresh`,
        headers,
        method: "Get"
      })
    })
  })
})

export const { useLoginMutation,
               useLogoutMutation,
               useLogoutAllMutation,
               useRefreshMutation,
               useLogoutSessionsMutation,
               useActiveSessionsQuery } = authSlice