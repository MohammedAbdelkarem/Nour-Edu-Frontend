// notificationSlice.js
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const notificationSlice = createApi({
  reducerPath: "notificationSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    sendAll: builder.mutation({
      query: ({body}) => ({
        url: `/notifications`,
        body,
        method: "POST"
      })
    }),
    sendCustom: builder.mutation({
      query: ({ body }) => ({
        url: `/notifications/private`,
        body,
        method: "POST"
      })
    })
  })
})

export const { useSendAllMutation, useSendCustomMutation } = notificationSlice