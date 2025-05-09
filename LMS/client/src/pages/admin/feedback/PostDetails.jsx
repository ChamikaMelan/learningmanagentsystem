import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/posts/post/${id}`);
        if (res.data.success) {
          setPost(res.data.post);
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (!post) {
    return (
      <div className="flex justify-center items-center h-[300px] text-gray-500 text-lg">
        Loading post details...
      </div>
    );
  }

  const { name, email, service, review, rating, reply } = post;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Card className="p-8 shadow-lg border rounded-2xl bg-white space-y-6">
        <h2 className="text-3xl font-bold text-primary text-center mb-6">{service}</h2>

        <div className="grid grid-cols-2 gap-6 text-gray-800">
          <div>
            <p className="font-semibold">Rating:</p>
            <p>{rating}</p>
          </div>
          <div>
            <p className="font-semibold">Name:</p>
            <p>{name}</p>
          </div>

          <div>
            <p className="font-semibold">Review:</p>
            <p>{review}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{email}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="font-semibold text-yellow-800 text-lg mb-1">Admin Reply:</p>
          <p className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg text-gray-700">
            {reply ? reply : 'No reply provided yet.'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PostDetails;
