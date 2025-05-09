import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CART_API = "http://localhost:8000/api/v1/cart";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CART_API,
    credentials: "include",
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // Get cart items
    getCartItems: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // Add item to cart
    addToCart: builder.mutation({
      query: (courseId) => ({
        url: "/add",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (courseId) => ({
        url: `/remove/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Clear cart
    clearCart: builder.mutation({
      query: () => ({
        url: "/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Create checkout session for multiple courses
    createCartCheckoutSession: builder.mutation({
      query: (courseIds) => ({
        url: "/checkout",
        method: "POST",
        body: { courseIds },
      }),
    }),

    // Get cart count
    getCartCount: builder.query({
      query: () => ({
        url: "/count",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartItemsQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useCreateCartCheckoutSessionMutation,
  useGetCartCountQuery,
} = cartApi;