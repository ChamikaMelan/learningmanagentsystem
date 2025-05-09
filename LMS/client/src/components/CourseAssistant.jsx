// src/components/CourseAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendChatMessageMutation, useGetChatHistoryQuery } from '@/features/api/chatService';

const CourseAssistant = ({ isOpen, onClose, courseId, currentLecture }) => {
  const [userInput, setUserInput] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const chatEndRef = useRef(null);
  
  const { data: chatHistoryData, isLoading: isHistoryLoading } = useGetChatHistoryQuery(courseId, {
    skip: !isOpen,
  });
  
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();
  
  // Initialize with welcome message if no history
  useEffect(() => {
    if (chatHistoryData && chatHistoryData.success) {
      if (chatHistoryData.data.length > 0) {
        setLocalMessages(chatHistoryData.data);
      } else {
        setLocalMessages([
          { role: 'system', content: 'Hello! How can I help you with this course?' }
        ]);
      }
    }
  }, [chatHistoryData]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Optimistically update UI
    const userMessage = { role: 'user', content: userInput };
    setLocalMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    try {
      // Send to backend
      const response = await sendMessage({
        courseId,
        lectureId: currentLecture?._id,
        message: userInput,
        lectureName: currentLecture?.lectureTitle
      }).unwrap();
      
      // Add assistant response
      if (response.success) {
        setLocalMessages(prev => [...prev, { role: 'system', content: response.data.message }]);
      }
    } catch (error) {
      // Handle error - add error message
      setLocalMessages(prev => [
        ...prev, 
        { role: 'system', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
      console.error('Chat error:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: "500px", zIndex: 50 }}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Course Assistant</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X size={18} />
        </Button>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isHistoryLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          localMessages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-3 ${
                msg.role === 'user' 
                  ? 'ml-auto bg-blue-500 text-white' 
                  : 'mr-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              } p-3 rounded-lg max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about this course..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isSending}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={isSending || !userInput.trim()}
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
        </Button>
      </form>
    </div>
  );
};

export default CourseAssistant;