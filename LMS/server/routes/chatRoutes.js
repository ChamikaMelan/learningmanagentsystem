// routes/chatRoutes.js
import express from 'express';
import  protect  from '../middlewares/isAuthenticated.js'; // Import protect middleware
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chatController.js'; // Import controllers

const router = express.Router();

// Apply the protect middleware to all chat routes
router.use(protect); // All routes below will require the user to be authenticated

// Define the routes
router.post('/send', sendChatMessage); // Send a chat message
router.get('/history/:courseId', getChatHistory); // Get chat history for a course
router.delete('/clear/:courseId', clearChatHistory); // Clear chat history for a course

export default router; // Export the router to be used in the main server file
