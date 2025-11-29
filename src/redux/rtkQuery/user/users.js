// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "../baseQuery"

export const userSlice = createApi({
  reducerPath: "userSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    list: builder.mutation({
      query: ({ headers, filterOptions}) => ({
        url: `/users/list?${filterOptions}`,
        headers,
        method: "GET"
      })
    }),
    profile: builder.mutation({
      query: ({ headers, id }) => ({
        url: `/users/profile/${id}`,
        headers,
        method: "GET"
      })
    }),
    sugs: builder.mutation({
      query: ({ headers, search }) => ({
        url: `/users/sugs?search=${search}`,
        headers,
        method: "GET"
      })
    }),
    restore: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/users/restore`,
        headers,
        body,
        method: "POST"
      })
    }),
    unban: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/users/ban/remove`,
        headers,
        body,
        method: "POST"
      })
    }),
    ban: builder.mutation({
      query: ({ headers, body }) => ({
        url: `/users/ban`,
        headers,
        body,
        method: "POST"
      })
    }),
    studentProfile: builder.mutation({
      query: ({ id }) => ({
        url: `/users/student-profile/${id}`,
        method: "GET"
      })
    }),
    studentProgress: builder.mutation({
      query: ({ id }) => ({
        url: `/users/student-progress/${id}`,
        method: "GET"
      })
    })
  })
})

export const { useBanMutation,
               useListMutation,
               useProfileMutation,
               useUnbanMutation,
               useSugsMutation,
               useRestoreMutation,
              useStudentProfileMutation,
              useStudentProgressMutation } = userSlice