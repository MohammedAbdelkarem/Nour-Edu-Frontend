// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const teacherSlice = createApi({
  reducerPath: "teacherSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: () => ({
        url: `/teachers`,
        method: "GET"
      })
    }),
    getByContext: builder.mutation({
      query: ({ context_id, context_type }) => ({
        url: `/teachers?context_id=${context_id}&context_type=${context_type}`,
        method: "GET"
      })
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/teachers`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/teachers/${id}`,
        body,
        method: "PUT"
      })
    }),
    attach: builder.mutation({
      query: ({ body }) => ({
        url: `/responsibilities/attach`,
        body,
        method: "POST"
      })
    }),
    deatach: builder.mutation({
        query: ({ body }) => ({
          url: `/responsibilities/detach`,
          body,
          method: "POST"
        })
      }),
    details: builder.mutation({
      query: ({ id, type }) => ({
        url: `/responsibilities/teacher/${id}?context_type=${type}`,
        method: "GET"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useAttachMutation,
               useDeatachMutation,
               useDetailsMutation,
               useGetByContextMutation,
               useUpdateMutation } = teacherSlice