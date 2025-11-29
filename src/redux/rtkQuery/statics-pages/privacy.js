// aboutSlice.js
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const privacySlice = createApi({
  reducerPath: "privacySlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ lang }) => ({
        url: `/system/privacy-policy${lang ? `/${lang}` : ""}`,
        method: "GET"
      })
    }),
    management: builder.mutation({
      query: ({ body }) => ({
        url: `/system/privacy-policy`,
        method: "POST",
        body
      })
    })
  })
})

export const { useGetMutation, useManagementMutation } = privacySlice