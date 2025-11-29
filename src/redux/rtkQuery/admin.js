// ** Redux Imports
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ** Import URL
import { admin_url } from "../../constant/url"

// ** Custom baseQuery wrapper to handle 401
const baseQuery = fetchBaseQuery({
  baseUrl: admin_url,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  }
})

const baseQueryWithAuthRedirect = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    localStorage.clear()
    window.location.href = "/#/login"
  }

  return result
}

export const adminSlice = createApi({
  reducerPath: "adminSlice",
  baseQuery: baseQueryWithAuthRedirect,
  endpoints: (builder) => ({
    overview: builder.mutation({
      query: () => ({
        url: `/overview`,
        method: "GET"
      })
    }),
    
    countries: builder.query({
      query: () => ({
        url: `/countries`,
        method: "GET"
      })
    }),
    cities: builder.mutation({
      query: ({ id }) => ({
        url: `/system/cities${id ? `/${id}` : ''}`,
        method: "GET"
      })
    }),
    profile: builder.mutation({
      query: ({id}) => ({
        url: `/profile/${id}`,
        method: "GET"
      })
    }),
    update: builder.mutation({
      query: ({id, body}) => ({
        url: `/profile/${id}`,
        body,
        method: "POST"
      })
    }),
    deactivate: builder.mutation({
      query: ({id}) => ({
        url: `/profile/deactivate/${id}`,
        method: "GET"
      })
    }),
    
    process: builder.mutation({
      query: ({id}) => ({
        url: `/complaints/process/${id}`,
        method: "GET"
      })
    })
  })
})

export const { useOverviewMutation,
               useProfileMutation,
               useUpdateMutation,
               useDeactivateMutation,
               useCountriesQuery,
               useCitiesMutation,
               useProcessMutation } = adminSlice