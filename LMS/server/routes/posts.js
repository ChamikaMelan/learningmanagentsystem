import express from 'express';
import { saveFeedback, getAllFeedback, getFeedbackById, updateFeedback, deleteFeedback } from '../controllers/feedback.controller.js'; // Import controller functions

const router = express.Router();

// Save posts
router.post('/post/save', saveFeedback);

// Get all posts
router.get('/posts', getAllFeedback);

// Get a specific post
router.get("/post/:id", getFeedbackById);

// Update post
router.put('/post/update/:id', updateFeedback);

// Delete post
router.delete('/post/delete/:id', deleteFeedback);

export default router;
