// src/features/api/chatService.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.userInfo?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Chat'],
  endpoints: (builder) => ({
    sendChatMessage: builder.mutation({
      query: (data) => ({
        url: '/chat/send',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chat'], // Optional: Refresh chat after sending
    }),

    getChatHistory: builder.query({
      query: (courseId) => `/chat/history/${courseId}`,
      providesTags: ['Chat'],
    }),

    clearChatHistory: builder.mutation({
      query: (courseId) => ({
        url: `/chat/clear/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useClearChatHistoryMutation,
} = chatApi;
