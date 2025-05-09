// StarRating.jsx
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating }) => {
  const fullStars = Math.round(rating);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) =>
        i < fullStars ? <FaStar key={i} color="gold" /> : <FaRegStar key={i} color="gray" />
      )}
    </div>
  );
};

export default StarRating;
