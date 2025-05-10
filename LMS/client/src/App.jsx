import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import HeroSection from "./pages/student/HeroSection";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import AllUsers from "./pages/admin/user/AllUsers";
import Payment from './pages/admin/payment/payment';
import Cart from "./components/Cart";
//PDFViewer
import PDFViewer from "./pages/student/PDFViewer";

import ForgotPassword from "./pages/ForgotPassword";

import CheckoutSuccessPage  from "./components/ui/checkoutSuccess";


import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";

import FeedbackHome from "./pages/student/FeedbackHome";
import CreatePost from "./pages/student/CreatePost";
import EditPost from "./pages/student/EditPost";
import FeedbackAdminHome from "./pages/admin/feedback/FeedbackAdminHome";
import Reply from "./pages/admin/feedback/Reply";
import PostDetails from "./pages/admin/feedback/PostDetails";



const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      // Add this new route for forgot password
      {
        path: "forgot-password",
        element: (
          <AuthenticatedUser>
            <ForgotPassword />
          </AuthenticatedUser>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
              <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
     
      {
        path: "checkout-success",
        element: (
          <ProtectedRoute>
            <CheckoutSuccessPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "feedback",
        element: (
          <ProtectedRoute>
            <FeedbackHome />
          </ProtectedRoute>
        ),
      },
      
      {
        path: "feedback/add",
        element: (
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        ),
      },

      {
        path: "feedback/edit/:id",
        element: (
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        ),
      },

      {
        path: "/view-pdf",
        element: (
          <ProtectedRoute>
            <PDFViewer />
          </ProtectedRoute>
        ),
      },


      // admin routes start from here
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "user",
            element: <AllUsers/>,
          },
          {
            path: "payment",
            element: <Payment/>,
          },
          {
            path: "course",
            element: <CourseTable />,
          },
         
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />,
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },


          {
            path: "AdminFeedback",
            element: <FeedbackAdminHome />,
          },

          {
            path: "FeedbackReply/:id",
            element: <Reply />,
          },

          {
            path: "feedback/post/:id",
            element: (
              <ProtectedRoute>
                <PostDetails />
              </ProtectedRoute>
            ),
          },

          
        ],
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <ThemeProvider>
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </main>
  );
}

export default App;