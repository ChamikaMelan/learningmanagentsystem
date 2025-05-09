// feedback.controller.js
import Posts from '../models/posts.js';

// Controller to save feedback
export const saveFeedback = async (req, res) => {
  try {
    const { name, email, service, review, rating } = req.body;
    if (!name || !email || !service || !review || !rating) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const newPost = new Posts(req.body);
    await newPost.save();
    return res.status(200).json({
      success: "FeedBack saved successfully"
    });
  } catch (err) {
    console.log("Error saving feedback:", err);
    return res.status(400).json({
      error: err.message || "An error occurred while saving feedback"
    });
  } 
};

// Controller to get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const posts = await Posts.find();
    return res.status(200).json({
      success: true,
      existingPosts: posts
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

// Controller to get specific feedback
export const getFeedbackById = async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "FeedBack not found" });
    }
    return res.status(200).json({ success: true, post });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// Controller to update feedback
export const updateFeedback = async (req, res) => {
  try {
    const updatedPost = await Posts.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    return res.status(200).json({
      success: "Updated Successfully",
      updatedPost
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

// Controller to delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const deletedPost = await Posts.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "FeedBack not found" });
    }
    return res.json({ message: "Delete Successful", deletedPost });
  } catch (err) {
    return res.status(400).json({ message: "Delete Unsuccessful", error: err.message });
  }
};
