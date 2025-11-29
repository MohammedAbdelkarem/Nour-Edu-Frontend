// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const mediaSlice = createApi({
  reducerPath: "mediaSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: ({ body }) => ({
        url: `/media`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/media/${id}`,
        body,
        method: "POST"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/media/delete?ids[]=${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useDeleteMutation, useUploadMutation, useUpdateMutation } = mediaSlice