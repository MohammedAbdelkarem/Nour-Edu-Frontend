// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const versionSlice = createApi({
  reducerPath: "versionSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: () => ({
        url: `/app-versions`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/app-versions`,
        body,
        method: "POST"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/app-versions/${id}`,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useDeleteMutation} = versionSlice