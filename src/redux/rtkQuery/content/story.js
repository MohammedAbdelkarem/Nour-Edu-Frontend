// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ** Import URL
import { admin_url } from "../../../constant/url"

export const storySlice = createApi({
  reducerPath: "storySlice",
  baseQuery: fetchBaseQuery({ baseUrl: admin_url }),
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers }) => ({
        url: `/story`,
        headers,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/story`,
        headers,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `/story/${id}`,
        headers,
        body,
        method: "POST"
      })
    }),
    status: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/story/changeStatus/${id}`,
        headers,
        method: "GET"
      })
    }),
    delete: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/story/${id}`,
        headers,
        method: "DELETE"
      })
    })
  })
})

export const { useGetMutation,
               useUpdateMutation,
               useStoreMutation,
               useDeleteMutation, 
               useStatusMutation } = storySlice