import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetPurchasedCoursesQuery,
  useGetSuccessfulPaymentCountQuery,
  useGetStripeBalanceQuery,
} from "@/features/api/purchaseApi";
import { useGetAllUsersQuery } from "@/features/api/authApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AllUsers from './user/AllUsers';

const Dashboard = () => {
  // Fetch all data
  const {
    data: purchasesData,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useGetPurchasedCoursesQuery();
  
  const {
    data: countData,
    isLoading: countLoading,
    error: countError,
  } = useGetSuccessfulPaymentCountQuery();
  
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useGetStripeBalanceQuery();

  // Add users query
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetAllUsersQuery();


  // Combined loading state
  const isLoading = purchasesLoading || countLoading || balanceLoading;
  const isError = purchasesError || countError || balanceError;

  // Data preparation
  const purchasedCourses = purchasesData?.purchasedCourse || [];
  const balance = balanceData?.balance || { available: 0, pending: 0 };

  //all users
  const totalUsers = usersData?.users?.length || 0;

  // Chart data formatting
  const courseData = purchasedCourses.map(course => ({
    name: course.courseId?.courseTitle?.substring(0, 15) + '...' || 'Course',
    price: course.courseId?.coursePrice || 0,
  }));

  if (isLoading) return <div className="p-4 text-center">Loading Dashboard...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading dashboard data</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Top Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              
              <div className="flex justify-between text-3xl font-bold text-white-300">
                <span>Available:</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${balance.pending.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Successful Payments Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {countData?.count || 0}
            </div>
          </CardContent>
        </Card>

        

        {/* Total Courses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {purchasedCourses.length}
            </div>
          </CardContent>
        </Card>
{/* Total Of Users */}
<Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
            {totalUsers}
            </div>
          </CardContent>
        </Card>
        
      </div>


    </div>
  );
};

export default Dashboard;