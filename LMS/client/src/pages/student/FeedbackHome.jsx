import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './FeedbackShared/Card.jsx';
import StarRating from './FeedbackShared/StarRating';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import './FeedbackHome.css';

export default function FeedbackHome() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const courseIdFromQuery = query.get('courseId');
  const courseNameFromQuery = query.get('courseName');

  useEffect(() => {
    retrievePosts();
  }, [courseNameFromQuery]);

  const retrievePosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/posts/posts");
      if (res.data.success) {
        let postsData = res.data.existingPosts;

        // ✅ Filter by courseName if available
        if (courseNameFromQuery) {
          postsData = postsData.filter(
            (post) => post.service === courseNameFromQuery
          );
        }

        setPosts(postsData);
        setReviewCount(postsData.length);
        setAverageRating(calculateAverageRating(postsData));
      }
    } catch (error) {
      console.error("Error retrieving posts:", error);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/posts/post/delete/${id}`);
        alert("Deleted successfully");
        retrievePosts();
      } catch (error) {
        console.error("Error deleting post:", error.message);
      }
    }
  };

  const filterData = (posts, searchKey) => {
    const result = posts.filter((post) =>
      post.service.toLowerCase().includes(searchKey.toLowerCase()) ||
      post.name.toLowerCase().includes(searchKey.toLowerCase()) ||
      post.review.toLowerCase().includes(searchKey.toLowerCase())
    );
    setPosts(result);
  };

  const handleSearchArea = async (e) => {
    const searchKey = e.currentTarget.value;
    try {
      const res = await axios.get("http://localhost:8000/api/v1/posts/posts");
      if (res.data.success) {
        let filteredPosts = res.data.existingPosts;
        if (courseNameFromQuery) {
          filteredPosts = filteredPosts.filter(
            (post) => post.service === courseNameFromQuery
          );
        }
        filterData(filteredPosts, searchKey);
      }
    } catch (error) {
      console.error("Error filtering posts:", error.message);
    }
  };

  const toggleExpand = (postId) => {
    setExpanded(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const calculateAverageRating = (posts) => {
    const totalRating = posts.reduce((acc, post) => acc + post.rating, 0);
    return totalRating / posts.length || 0;
  };

  return (
    <div className='feed_body'>
      <div className="feed-row">
        <div className="feed_col-lg-9">
          <h4 className='feed_header'>Feedback for: {courseNameFromQuery || 'All Courses'}</h4><br />
          <p>Total Reviews: {reviewCount}</p>
          <p>Average Rating: {averageRating.toFixed(2)}</p>
        </div>
        <div className="feed_col-lg-3">
          <input
            className="feed_form-control feed_btnsearch"
            type="search"
            placeholder="Search"
            name="searchQuery"
            onChange={handleSearchArea}
          />
        </div>
      </div>

      <div className="feed_post-list">
        {posts.map((post) => (
          <Card key={post._id} className="feed_post-card">

            <div className="feed_num-display_star">
              {post.rating !== null && post.rating !== undefined ? (
                <StarRating rating={post.rating} />
              ) : (
                <span>No Rating</span>
              )}
            </div>

            <button onClick={() => onDelete(post._id)} className="feed_close">
              <FaTrashAlt color="black" size={20} />
            </button>

            <button
              className="feed_edit-button"
              onClick={() => navigate(`/feedback/edit/${post._id}`)}
            >
              <FaEdit color="black" size={20} />
            </button>

            <div className="feed_text-display">
              <div>Review: {post.review}</div>
              <div className='feed_answer'>Answer: {post.reply}</div><br />

              {!expanded[post._id] && (
                <button onClick={() => toggleExpand(post._id)} className='feed_see-more'>
                  See More
                </button>
              )}
              {expanded[post._id] && (
                <div>
                  <div>Name: {post.name}</div>
                  <div>Email: {post.email}</div>

                  <button onClick={() => toggleExpand(post._id)} className='feed_see-more'>
                    See Less
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {courseIdFromQuery && courseNameFromQuery && (
        <button
          className="feed_btn-success"
          onClick={() =>
            navigate(`/feedback/add?courseId=${courseIdFromQuery}&courseName=${encodeURIComponent(courseNameFromQuery)}`)
          }
        >
          Give Feedback
        </button>
      )}
    </div>
  );
}
