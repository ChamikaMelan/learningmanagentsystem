import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Reply.css';

const Reply = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [reply, setReply] = useState("");

  const handleInputChange = (e) => {
    setReply(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      alert("Please enter your reply.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/v1/posts/post/update/${id}`, { reply });
      if (response.data.success) {
        alert("Feedback reply submitted successfully!");
        
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("An error occurred while submitting your reply.");
    }
  };

  return (
    <div className="reply-container">
  <h2 className="reply-header">Reply to Feedback</h2>
  <form onSubmit={handleSubmit}>
    <label htmlFor="reply" className="reply-label">Your Reply</label>
    <textarea
      id="reply"
      className="reply-textarea"
      placeholder="Write your reply here..."
      value={reply}
      onChange={handleInputChange}
      required
    ></textarea>

    <button type="submit" className="reply-button">Submit Reply</button>
  </form>
</div>

  );
};

export default Reply;
