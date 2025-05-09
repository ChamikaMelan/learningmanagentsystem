// src/controllers/chatController.js
import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import { Course } from '../models/course.model.js';

// @desc    Send a chat message and get a response
// @route   POST /api/chat/send
// @access  Private
const sendChatMessage = asyncHandler(async (req, res) => {
    const { courseId, lectureId, message, lectureName } = req.body;
    const userId = req.user._id;
  
    // Validate required fields
    if (!courseId || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Course ID and message are required'
      });
    }
  
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
  
    let chatSession = await Chat.findOne({ user: userId, course: courseId });
    if (!chatSession) {
      chatSession = new Chat({ 
        user: userId, 
        course: courseId, 
        messages: [] 
      });
    }
  
    // Add user message with null checks
    chatSession.messages.push({
      role: 'user',
      content: message,
      lectureId: lectureId || null
    });
  
    // Enhanced AI response logic
    const aiResponse = generateAIResponse(message, lectureName, course.courseTitle);
    
    chatSession.messages.push({
      role: 'system',
      content: aiResponse,
      lectureId: lectureId || null
    });
  
    await chatSession.save();
  
    res.status(200).json({ 
      success: true, 
      data: { message: aiResponse } 
    });
  });
  
  // Helper function for AI responses
  const generateAIResponse = (message, lectureName, courseTitle) => {
    const lowerMsg = message.toLowerCase();
    const context = lectureName || 'this course';
  
    if (lowerMsg.includes('lecture') || lowerMsg.includes('video')) {
      return lectureName 
        ? `This lecture covers ${lectureName}. What specific part do you need help with?`
        : `Let me know which lecture you're referring to and I'll help!`;
    }
    if (lowerMsg.includes('help')) {
      return `I'm here to assist with "${courseTitle}". Ask me about concepts, summaries, or exercises.`;
    }
    if (lowerMsg.includes('example') || lowerMsg.includes('exercise')) {
      return `Here's a practice exercise for ${context}: [Sample exercise]`;
    }
    return `Great question about ${context}! Here's some detailed information...`;
  };
  

// @desc    Get chat history
const getChatHistory = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const chatSession = await Chat.findOne({ user: userId, course: courseId });
  if (!chatSession) {
    return res.status(200).json({ success: true, data: [] });
  }

  const formattedMessages = chatSession.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  res.status(200).json({ success: true, data: formattedMessages });
});

// @desc    Clear chat history
const clearChatHistory = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  await Chat.findOneAndDelete({ user: userId, course: courseId });
  res.status(200).json({ success: true, message: 'Chat history cleared' });
});

export { sendChatMessage, getChatHistory, clearChatHistory };
