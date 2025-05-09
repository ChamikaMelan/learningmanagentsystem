import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import RatingSelect from '@/components/RatingSelect';
import './EditPost.css';


const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    review: '',
    rating: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/posts/post/${id}`);
        const post = res.data.post;
        setFormData({
          name: post.name,
          email: post.email,
          service: post.service,
          review: post.review,
          rating: post.rating
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Unable to load feedback. Please try again.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const validateForm = () => {
    const { name, email, service, review } = formData;

    if (!name || !email || !service || !review) {
      alert('All fields are required.');
      return false;
    }

    

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const res = await axios.put(`http://localhost:8000/api/v1/posts/post/update/${id}`, formData);
    if (res.data.success) {
      alert('Feedback updated successfully!');
      navigate(`/feedback?courseId=${encodeURIComponent(formData.service)}&courseName=${encodeURIComponent(formData.service)}`);
    }
  } catch (err) {
    console.error('Update failed:', err);
    alert('Something went wrong. Please try again.');
  }
};


  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <Card className="p-6 space-y-6">

      <div className="edit-post-container">
  <form onSubmit={handleSubmit}>
    <h2>Edit Feedback</h2>

    <div className="rating-wrapper">
      <RatingSelect select={handleRatingChange} selected={formData.rating} />
    </div>

    <label htmlFor="name">Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      placeholder="Your Name"
    />


    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Email"
    />

    <input
      type="text"
      name="service"
      value={formData.service}
      onChange={handleChange}
      placeholder="Course Name"
    />

    <textarea
      name="review"
      value={formData.review}
      onChange={handleChange}
      placeholder="Write your review..."
    />

    <button type="submit">Update</button>
  </form>
</div>
      </Card>
    </div>
  );
};

export default EditPost;
