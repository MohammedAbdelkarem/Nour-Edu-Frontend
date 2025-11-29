// apiBase.js
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { admin_url } from '../../constant/url'

const baseQuery = fetchBaseQuery({
  baseUrl: admin_url,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem('refresh')
    if (!refreshToken) {
      // No refresh token => logout user
      localStorage.clear()
      window.location.href = '/login'
      return result
    }

    const refreshResult = await baseQuery(
      {
        url: '/refresh', // Your refresh endpoint
        method: 'GET',
        headers: refreshToken 
      },
      api
    )

    if (refreshResult.data) {
      // Save new tokens in localStorage
      localStorage.setItem('token', refreshResult.data.tokens.access_token)
      localStorage.setItem('refresh', refreshResult.data.tokens.refresh_token)
      localStorage.setItem('access_expire_in', refreshResult.data.tokens.access_expire_in.toString())
      localStorage.setItem('refresh_expire_in', refreshResult.data.tokens.refresh_expire_in.toString())

      // Retry original query with new access token
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh failed => logout user
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  return result
}

export default baseQueryWithReauth
