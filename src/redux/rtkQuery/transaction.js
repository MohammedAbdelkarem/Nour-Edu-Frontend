// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const transactionSlice = createApi({
  reducerPath: "transactionSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ filterOptions }) => ({
        url: `/transactions?${filterOptions}`,
        method: "GET"
      })
    }),
    createStudent: builder.mutation({
      query: ({ body }) => ({
        url: `/transactions/create-student-cupon`,
        body,
        method: "POST"
      })
    }),
    createContext: builder.mutation({
      query: ({ body }) => ({
        url: `/transactions/create-context-cupon`,
        body,
        method: "POST"
      })
    }),
    getCoupons: builder.mutation({
      query: ({ filterOptions }) => ({
        url: `/transactions/copons?${filterOptions}`,
        method: "GET"
      })
    }),
    expired: builder.mutation({
      query: ({ id }) => ({
        url: `/transactions/set-copons-as-expired?ids[]=${id}`,
        method: "GET"
      })
    })
  })
})

export const { useCreateStudentMutation,
               useCreateContextMutation,
               useGetMutation,
               useGetCouponsMutation,
               useExpiredMutation } = transactionSlice