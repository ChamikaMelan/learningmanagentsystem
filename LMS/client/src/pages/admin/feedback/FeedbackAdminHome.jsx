import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './FeedbackAdminHome.css';

const FeedbackAdminHome = () => {
  const [posts, setPosts] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [replySubmitted, setReplySubmitted] = useState(false);
  const tableRef = useRef();

  useEffect(() => {
    retrievePosts();
  }, []);

  const retrievePosts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/posts/posts');
      if (res.data.success) {
        setPosts(res.data.existingPosts);
      }
    } catch (err) {
      console.error('Error retrieving posts', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/posts/post/delete/${id}`);
        alert('Deleted Successfully');
        retrievePosts();
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  const handleSearch = async (e) => {
    const key = e.target.value.toLowerCase();
    setSearchKey(key);
    try {
      const res = await axios.get('http://localhost:8000/api/v1/posts/posts');
      if (res.data.success) {
        const filtered = res.data.existingPosts.filter(post =>
          post.service.toLowerCase().includes(key) ||
          post.name.toLowerCase().includes(key) ||
          post.review.toLowerCase().includes(key) ||
          post.email.toLowerCase().includes(key)
        );
        setPosts(filtered);
      }
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
    alert('Users Report Successfully Downloaded!');
  };

  return (
    <div className="feed_admincontainer">
      <div className="feed_adminrow">
        <h4 className="feed_admin_header">All Feedback Posts</h4>
        <div className="d-flex gap-2 no-print">
          <input
            type="text"
            placeholder="Search..."
            className="feed_admin_form_control feed_admin_btnsearch"
            value={searchKey}
            onChange={handleSearch}
          />
          <button className="feed_admin_dRepo" id="feed_admin_genRepo" onClick={handlePrint}>
            Download Report
          </button>
        </div>
      </div><br></br>

      <div className="table-responsive">
        <table className="feed_admin_table" ref={tableRef}>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Rating</th>
              <th>Name</th>
              <th>Review</th>
              <th>Answer</th>
              <th id="feed_admin_genRepo">Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post._id}>
                <td>{index + 1}</td>
                <td>
                  <a href={`feedback/post/${post._id}`} className="text-decoration-none">
                    {post.service}
                  </a>
                </td>
                <td>{post.rating}</td>
                <td>{post.name}</td>
                <td>{post.review}</td>
                <td>{post.reply || '—'}</td>
                <td>
                  {!post.reply && !replySubmitted && (
                    <a className="feed_admin_btn_warning" id="feed_admin_genRepo" href={`/admin/FeedbackReply/${post._id}`}>
                      <i className="fas fa-edit"></i> Reply
                    </a>
                  )}&nbsp;
                  <button
                    className="feed_admin_btn_danger" id="feed_admin_genRepo"
                    onClick={() => handleDelete(post._id)}
                  >
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackAdminHome;
