
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const tosSlice = createApi({
  reducerPath: "tosSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ lang }) => ({
        url: `/system/tos${lang ? `/${lang}` : ""}`,
        method: "GET"
      })
    }),
    management: builder.mutation({
      query: ({ body }) => ({
        url: `/system/tos`,
        method: "POST",
        body
      })
    })
  })
})

export const { useGetMutation, useManagementMutation } = tosSlice