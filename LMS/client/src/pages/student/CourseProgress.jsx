// CourseProgress.jsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { 
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useClearChatHistoryMutation,
} from "@/features/api/chatService";
import { 
  CheckCircle, 
  CheckCircle2, 
  CirclePlay,
  MessageCircle,
  Send,
  X,
  Loader2,
  Trash2
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser 
            ? 'bg-primary text-white' 
            : 'bg-muted text-black dark:text-muted-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();

  // Chat state and hooks
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const { data: chatHistoryData, refetch: refetchChatHistory } = useGetChatHistoryQuery(courseId);
  const [sendChatMessage, { isLoading: isSendingMessage }] = useSendChatMessageMutation();
  const [clearChatHistory] = useClearChatHistoryMutation();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistoryData]);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const initialLecture = currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };
  
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
  
    try {
      const lectureId = currentLecture?._id || 
                       (courseDetails.lectures?.length && courseDetails.lectures[0]?._id);
      
      if (!lectureId) {
        toast.error("No lecture selected");
        return;
      }
  
      await sendChatMessage({
        courseId,
        lectureId,
        message: chatMessage,
        lectureName: currentLecture?.lectureTitle || 
                   (courseDetails.lectures[0]?.lectureTitle || "this course")
      }).unwrap();
      
      setChatMessage('');
      await refetchChatHistory();
    } catch (err) {
      toast.error(err.data?.message || "Failed to send message");
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(courseId);
      toast.success("Chat history cleared");
      refetchChatHistory();
    } catch (error) {
      toast.error("Failed to clear chat history");
    }
  };

  const chatMessages = chatHistoryData?.data || [];
  const selectedLecture = currentLecture || initialLecture;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Course Title and Complete Button */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* Video and PDF Section */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            <video
              src={selectedLecture?.videoUrl}
              controls
              className="w-full h-auto md:rounded-lg"
              onPlay={() => handleLectureProgress(selectedLecture._id)}
            />
          </div>

          <div className="mt-2">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex((lec) => lec._id === selectedLecture._id) + 1
              } : ${selectedLecture.lectureTitle}`}
            </h3>
          </div>

          {selectedLecture?.pdfUrl && (
            <div className="mt-4">
              <h4 className="font-medium text-md mb-2">Lecture PDF</h4>
              <iframe
                src={selectedLecture.pdfUrl}
                className="w-full h-96 border rounded-lg"
                title="Lecture PDF"
              ></iframe>
              <Button
                className="mt-2"
                onClick={() =>
                  navigate("/view-pdf", {
                    state: { pdfUrl: selectedLecture.pdfUrl },
                  })
                }
              >
                Open PDF in New Page
              </Button>
            </div>
          )}
        </div>

        {/* Lecture List */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === selectedLecture._id ? "bg-gray-200 dark:bg-gray-800" : ""
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-medium">{lecture.lectureTitle}</CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge variant={"outline"} className="bg-green-200 text-green-600">
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Button */}
        <Button
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 flex items-center justify-center"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </Button>

        {/* Chat Interface */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-6 w-80 md:w-96 h-96 bg-background border border-border rounded-lg shadow-lg flex flex-col overflow-hidden z-10">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-medium">Course Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleClearChat}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div 
              ref={chatContainerRef}
              className="flex-1 p-3 overflow-y-auto"
            >
              {chatMessages.length === 0 ? (
                <div className="text-muted-foreground text-center mt-10">
                  Ask a question about this lecture
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))
              )}
            </div>
            <form 
              onSubmit={handleSendMessage}
              className="border-t p-3 flex gap-2"
            >
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={isSendingMessage}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isSendingMessage || !chatMessage.trim()}
              >
                {isSendingMessage ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;
