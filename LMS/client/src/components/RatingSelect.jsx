import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingSelect = ({ select, selected }) => {
  const [hovered, setHovered] = useState(null);

  const handleMouseEnter = (value) => setHovered(value);
  const handleMouseLeave = () => setHovered(null);
  const handleClick = (value) => select(value);

  return (
    <div className="flex justify-center">
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          const isFilled = hovered ? value <= hovered : value <= selected;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`${
                  isFilled ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSelect;
