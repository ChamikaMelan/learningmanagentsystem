import { useEffect,useMemo } from 'react';
import React, { useRef } from 'react';

import { format } from 'date-fns';//date
import html2canvas from 'html2canvas';//image download 
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
  Bar,
  BarChart,
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
     const chartRef = useRef(null);
     
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
// Chart data formatting for user login dates
// Step 1: Create a map of login counts per day
const loginCounts = {};

usersData?.users?.forEach(user => {
  if (user.lastLogin) {
    const dateObj = new Date(user.lastLogin);
    const dateKey = dateObj.toISOString().slice(0, 10); // "2025-04-28"
    loginCounts[dateKey] = (loginCounts[dateKey] || 0) + 1;
  }
});

// Format and sort
const loginChartData = Object.entries(loginCounts)
  .map(([dateKey, count]) => ({
    dateKey,
    dateLabel: format(new Date(dateKey), 'dd MMM'), // e.g., "28 Apr"
    count,
  }))
  .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));;

///download picture

//
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
 {/* Users Login Chart */}
{/* Users Login Chart with Download Button */}
<Card className="w-full">
  <CardHeader className="flex justify-between items-center">
    <CardTitle className="text-lg">Users Login Chart</CardTitle>
    <button
      onClick={async () => {
        if (!chartRef.current) return;
        const canvas = await html2canvas(chartRef.current);
        const link = document.createElement('a');
        link.download = 'login-chart.png';
        link.href = canvas.toDataURL();
        link.click();
      }}
      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
    >
      Download Chart
    </button>
  </CardHeader>
  <CardContent ref={chartRef}>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={loginChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dateLabel"
          angle={0}
          textAnchor="end"
          tick={{ fontSize: 12 }}
          interval={0}
          label={{ value: 'Login Date', position: 'insideBottom', offset: -1 }}
        />
        <YAxis
          allowDecimals={false}
          label={{ value: 'Count', angle: -90, position: '' }}
        />
        <Tooltip />
        <Bar type="monotone" dataKey="count" stroke="#2f4d8f"  fill="#2f4d8f" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

      </div>


    </div>
  );
};

export default Dashboard;