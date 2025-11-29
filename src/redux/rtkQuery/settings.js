// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const settingsSlice = createApi({
  reducerPath: "settingsSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers }) => ({
        url: `/system/settings`,
        headers,
        method: "GET"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `system/settings/${id}`,
        headers,
        body,
        method: "PUT"
      })
    })
  })
})

export const { useGetMutation, useUpdateMutation } = settingsSlice