import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:8000/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Payment session creation
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),

    // Course details with purchase status
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),

    // Purchased courses list
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),

    // Successful payments count
    getSuccessfulPaymentCount: builder.query({
      query: () => ({
        url: `/successful-count`,
        method: "GET",
      }),
    }),

    // Stripe balance endpoint (new addition)
    getStripeBalance: builder.query({
      query: () => ({
        url: "/balance",
        method: "GET",
      }),
    }),

    getStripeTransactions: builder.query({
      query: () => ({
        url: "/transactions",
        method: "GET",
      }),
    }),

    getTotalTransactionCount: builder.query({
      query: () => ({
        url: "/transaction-count",
        method: "GET",
      }),
    }),




  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useGetSuccessfulPaymentCountQuery,
  useGetStripeBalanceQuery,
  useGetStripeTransactionsQuery,
  useGetTotalTransactionCountQuery
} = purchaseApi;