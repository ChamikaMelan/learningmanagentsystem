// chatRoute.js
import express from 'express';
import { protect } from '../middlewares/isAuthenticated.js';
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chatController.js';

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(protect);

router.post('/send', sendChatMessage);
router.get('/history/:courseId', getChatHistory);
router.delete('/clear/:courseId', clearChatHistory);

export default router;