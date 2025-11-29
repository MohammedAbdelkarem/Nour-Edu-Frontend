// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ** Import URL
import { admin_url } from "../../../constant/url"

export const bannerSlice = createApi({
  reducerPath: "bannerSlice",
  baseQuery: fetchBaseQuery({ baseUrl: admin_url }),
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ headers }) => ({
        url: `/banner`,
        headers,
        method: "GET"
      })
    }),
    store: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/banner`,
        headers,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ headers, body, id }) => ({
        url: `/banner/${id}`,
        headers,
        body,
        method: "POST"
      })
    }),
    status: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/banner/changeStatus/${id}`,
        headers,
        method: "GET"
      })
    }),
    delete: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/banner/${id}`,
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
               useStatusMutation } = bannerSlice