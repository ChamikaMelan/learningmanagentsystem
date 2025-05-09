// components/StarDisplay.jsx
import React from 'react';
import { Star } from 'lucide-react';

const StarDisplay = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < rating;
        return (
          <Star
            key={i}
            size={20}
            className={`${
              isFilled ? 'fill-yellow-400 stroke-black' : 'stroke-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

export default StarDisplay;
