import React, { useRef, useState, useMemo } from 'react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
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
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
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

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetAllUsersQuery();

  const {
    data: creatorCoursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCreatorCourseQuery();

  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const isLoading = purchasesLoading || countLoading || balanceLoading || usersLoading || coursesLoading;
  const isError = purchasesError || countError || balanceError || usersError || coursesError;

  const purchasedCourses = purchasesData?.purchasedCourse || [];
  const balance = balanceData?.balance || { available: 0, pending: 0 };
  const totalUsers = usersData?.users?.length || 0;

  // Filtered Courses Logic
  const filteredCourses = useMemo(() => {
    if (!creatorCoursesData?.courses) return [];
    return creatorCoursesData.courses.filter((course) => {
      const titleMatch = course.courseTitle
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      const statusMatch =
        searchStatus === "" ||
        (searchStatus === "Published" && course.isPublished) ||
        (searchStatus === "Draft" && !course.isPublished);
      return titleMatch && statusMatch;
    });
  }, [creatorCoursesData, searchTitle, searchStatus]);

  // User login chart data
  const loginCounts = {};
  usersData?.users?.forEach(user => {
    if (user.lastLogin) {
      const dateObj = new Date(user.lastLogin);
      const dateKey = dateObj.toISOString().slice(0, 10);
      loginCounts[dateKey] = (loginCounts[dateKey] || 0) + 1;
    }
  });

  const loginChartData = Object.entries(loginCounts)
    .map(([dateKey, count]) => ({
      dateKey,
      dateLabel: format(new Date(dateKey), 'dd MMM'),
      count,
    }))
    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

  if (isLoading) return <div className="p-4 text-center">Loading Dashboard...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading dashboard data</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-3xl font-bold text-white-300">
              <span>Available:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${balance.pending.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {countData?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {filteredCourses.length}
            </div>
          </CardContent>
        </Card>

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

      {/* Login Chart */}
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
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2f4d8f" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
