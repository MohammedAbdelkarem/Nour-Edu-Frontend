// aboutSlice.js
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const aboutSlice = createApi({
  reducerPath: "aboutSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["about"],
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ lang }) => ({
        url: `/system/about-us${lang ? `/${lang}` : ""}`,
        method: "GET"
      }),
      providesTags: ["about"]
    }),
    management: builder.mutation({
      query: ({ body }) => ({
        url: `/system/about-us`,
        method: "POST",
        body
      }),
      invalidatesTags: ["about"]
    })
  })
})

export const { useGetMutation, useManagementMutation } = aboutSlice