import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8000/api/v1/user/"

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        }),
        deleteUser: builder.mutation({
            query: () => ({
                url: "delete-profile",
                method: "DELETE",
                credentials: "include"
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    dispatch(userLoggedOut()); // Clear user data after deletion
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        
        //all users detais get
    getAllUsers: builder.query({
        query: () => ({
            url: "all-users",
            method: "GET"
        })
    }),
    ///delete
    deleteUser: builder.mutation({
        query: (userId) => ({
          url: userId ? `delete-user/${userId}` : "delete-profile",
          method: "DELETE",
          credentials: "include"
        }),
        async onQueryStarted(arg, { queryFulfilled, dispatch }) {
          try {
           await queryFulfilled;
            // Only logout if it's self-deletion
            if (!arg) {
              dispatch(userLoggedOut());
            }
            
          } catch (error) {
            console.error("Delete error:", error); 
          }
        }
      }),
    }),

});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetAllUsersQuery,
    
} = authApi;
