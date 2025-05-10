import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/AddToCartButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data || {};
  console.log(purchased);

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const handleViewFeedback = () => {
    navigate(`/feedback?courseId=${courseId}&courseName=${encodeURIComponent(course.courseTitle)}`);
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "clamp(-1.75px, -0.25vw, -3.5px)",
              position: "relative",
              overflow: "hidden",
              margin: 0,
            }}
          >
            {course?.courseTitle || "Course Title"}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 2,
                mixBlendMode: "darken",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  position: "absolute",
                  width: "60vw",
                  height: "60vw",
                  backgroundColor: "#00c2ff",
                  borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                  filter: "blur(1rem)",
                  mixBlendMode: "overlay",
                  top: "-50%",
                  animation: "aurora-border 6s ease-in-out infinite, aurora-1 12s ease-in-out infinite alternate",
                }}
              ></div>
              <div
                style={{
                  overflow: "hidden",
                  position: "absolute",
                  width: "60vw",
                  height: "60vw",
                  backgroundColor: "#ffc640",
                  borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                  filter: "blur(1rem)",
                  mixBlendMode: "overlay",
                  right: 0,
                  top: 0,
                  animation: "aurora-border 6s ease-in-out infinite, aurora-2 12s ease-in-out infinite alternate",
                }}
              ></div>
              <div
                style={{
                  overflow: "hidden",
                  position: "absolute",
                  width: "60vw",
                  height: "60vw",
                  backgroundColor: "#33ff8c",
                  borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                  filter: "blur(1rem)",
                  mixBlendMode: "overlay",
                  left: 0,
                  bottom: 0,
                  animation: "aurora-border 6s ease-in-out infinite, aurora-3 8s ease-in-out infinite alternate",
                }}
              ></div>
              <div
                style={{
                  overflow: "hidden",
                  position: "absolute",
                  width: "60vw",
                  height: "60vw",
                  backgroundColor: "#e54cff",
                  borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
                  filter: "blur(1rem)",
                  mixBlendMode: "overlay",
                  right: 0,
                  bottom: "-50%",
                  animation: "aurora-border 6s ease-in-out infinite, aurora-4 24s ease-in-out infinite alternate",
                }}
              ></div>
            </div>
          </h1>

          <style jsx>{`
            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap");

            body {
              min-height: 100vh;
              display: grid;
              place-items: center;
              background-color: #000000;
              color: #fff;
              font-family: "Inter", "DM Sans", Arial, sans-serif;
            }

            *,
            *::before,
            *::after {
              font-family: inherit;
              box-sizing: border-box;
            }

            @keyframes aurora-1 {
              0% { top: 0; right: 0; }
              50% { top: 100%; right: 75%; }
              75% { top: 100%; right: 25%; }
              100% { top: 0; right: 0; }
            }

            @keyframes aurora-2 {
              0% { top: -50%; left: 0%; }
              60% { top: 100%; left: 75%; }
              85% { top: 100%; left: 25%; }
              100% { top: -50%; left: 0%; }
            }

            @keyframes aurora-3 {
              0% { bottom: 0; left: 0; }
              40% { bottom: 100%; left: 75%; }
              65% { bottom: 40%; left: 50%; }
              100% { bottom: 0; left: 0; }
            }

            @keyframes aurora-4 {
              0% { bottom: -50%; right: 0; }
              50% { bottom: 0%; right: 40%; }
              90% { bottom: 50%; right: 25%; }
              100% { bottom: -50%; right: 0; }
            }

            @keyframes aurora-border {
              0% { border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%; }
              25% { border-radius: 47% 29% 39% 49% / 61% 19% 66% 26%; }
              50% { border-radius: 57% 23% 47% 72% / 63% 17% 66% 33%; }
              75% { border-radius: 28% 49% 29% 100% / 93% 20% 64% 25%; }
              100% { border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%; }
            }
          `}</style>

          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator?.name || "Unknown"}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt?.split("T")[0] || "N/A"}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
            <Button 
              variant="outline" 
              onClick={handleViewFeedback}
              className="text-white bg-transparent hover:bg-white hover:text-[#2D2F31]"
            >
              See Feedbacks
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course?.description || "" }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course?.lectures?.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                  </span>
                  <p>{lecture?.lectureTitle || "Untitled Lecture"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <img
                  src={course?.courseThumbnail}
                  alt={`${course?.courseTitle || "Course"} thumbnail`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-lg font-medium mb-2">
                Course Level: {course?.courseLevel || "Not specified"}
              </p>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <h1 className="text-lg md:text-xl font-medium text-white-900">
                  Course Price:
                </h1>
                <span className="text-xl md:text-2xl font-bold text-white-700">
                  Rs.{course?.coursePrice?.toLocaleString("en-IN") || "N/A"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <>
                  <BuyCourseButton courseId={courseId} className="w-full" />
                  <AddToCartButton 
                    courseId={courseId}
                    variant="outline"
                    className="w-full"
                  />
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;