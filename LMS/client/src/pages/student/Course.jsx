import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-xl dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group relative">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            alt="course"
            className="w-full h-40 object-cover rounded-t-xl group-hover:brightness-75 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="hover:underline font-bold text-lg truncate text-gray-900 dark:text-white">
            {course.courseTitle}
          </h1>
          <div className="flex items-center gap-3">
            
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {course.instructorName}
            </span>
          </div>
          {/* Course Level and Price on the same line */}
          <div className="flex items-center justify-between">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 text-xs rounded-full shadow-md">
              {course.courseLevel}
            </Badge>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Rs.{course.coursePrice}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
