// ** Redux Imports
import { createApi } from "@reduxjs/toolkit/query/react"
import baseQueryWithReauth from "./baseQuery"

export const quizSlice = createApi({
  reducerPath: "quizSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    get: builder.mutation({
      query: ({ context_id, context_type, page, per_page }) => ({
        url: `/quizzes?page=${page}&per_page=${per_page}&context_id=${context_id}&context_type=${context_type}`,
        method: "GET"
      })
    }),
    getQuestions: builder.mutation({
      query: ({ subject_ids, unit_ids, sub_unit_ids, lesson_ids, page, per_page }) => {
        console.log('RTK Query - Received parameters:')
        console.log('subject_ids:', subject_ids)
        console.log('unit_ids:', unit_ids)
        console.log('sub_unit_ids:', sub_unit_ids)
        console.log('lesson_ids:', lesson_ids)
        console.log('page:', page)
        console.log('per_page:', per_page)
        
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('per_page', per_page)
        
        // Add subject_ids as array parameters
        if (subject_ids && subject_ids.length > 0) {
          subject_ids.forEach(id => {
            params.append('subject_ids[]', id)
          })
        }
        
        // Add unit_ids as array parameters
        if (unit_ids && unit_ids.length > 0) {
          unit_ids.forEach(id => {
            params.append('unit_ids[]', id)
          })
        }
        
        // Add sub_unit_ids as array parameters
        if (sub_unit_ids && sub_unit_ids.length > 0) {
          sub_unit_ids.forEach(id => {
            params.append('sub_unit_ids[]', id)
          })
        }
        
        // Add lesson_ids as array parameters
        if (lesson_ids && lesson_ids.length > 0) {
          lesson_ids.forEach(id => {
            params.append('lesson_ids[]', id)
          })
        }
        
        const finalUrl = `/questions?${params.toString()}`
        console.log('Final API URL:', finalUrl)
        console.log('URLSearchParams entries:')
        for (const [key, value] of params.entries()) {
          console.log(`${key}: ${value}`)
        }
        
        return {
          url: finalUrl,
          method: "GET"
        }
      }
    }),
    create: builder.mutation({
      query: ({ body }) => ({
        url: `/quizzes`,
        body,
        method: "POST"
      })
    }),
    update: builder.mutation({
      query: ({ body, id }) => ({
        url: `/quizzes/${id}/update`,
        body,
        method: "POST"
      })
    }),
    delete: builder.mutation({
      query: ({ id }) => ({
        url: `/quizzes/${id}`,
        method: "DELETE"
      })
    }),
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/quizzes/${id}/change-publish-status?status=${status}`,
        method: "PATCH"
      })
    }),
    deatachQuestions: builder.mutation({
      query: ({ id, q_id }) => ({
        url: `/quizzes/detach-questions/${id}?question_ids[]=${q_id}`,
        method: "GET"
      })
    }),
    attachQuestions: builder.mutation({
      query: ({ id, q_id }) => ({
        url: `/quizzes/attach-questions/${id}?question_ids[]=${q_id}`,
        method: "GET"
      })
    })
  })
})

export const { useGetMutation,
               useCreateMutation,
               useUpdateMutation,
               useDeleteMutation,
               useGetQuestionsMutation,
               useChangeStatusMutation,
               useDeatachQuestionsMutation,
               useAttachQuestionsMutation } = quizSlice