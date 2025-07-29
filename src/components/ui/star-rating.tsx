import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  initialRating = 0,
  size = 'md',
  readonly = false,
  onChange,
  className
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (selectedRating: number) => {
    if (readonly) return;
    
    setRating(selectedRating);
    if (onChange) {
      onChange(selectedRating);
    }
  };

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const starSize = sizes[size];

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = (hoverRating || rating) >= starValue;
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "cursor-pointer transition-colors",
              isActive 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300",
              readonly ? "cursor-default" : "hover:text-yellow-300"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
