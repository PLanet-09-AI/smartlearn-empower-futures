import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { ratingService } from "@/services/ratingService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

interface CourseRatingModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

const CourseRatingModal: React.FC<CourseRatingModalProps> = ({
  isOpen,
  setIsOpen,
  courseId,
  courseTitle
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  useEffect(() => {
    const loadExistingRating = async () => {
      if (!currentUser || !courseId) return;
      
      try {
        const userRating = await ratingService.getUserRating(currentUser.uid, courseId);
        if (userRating) {
          setExistingRating(userRating);
          setRating(userRating.rating);
          setComment(userRating.comment || '');
        }
      } catch (error) {
        console.error("Error loading existing rating:", error);
      }
    };
    
    if (isOpen) {
      loadExistingRating();
    }
  }, [isOpen, currentUser, courseId]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to submit a rating');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await ratingService.addRating(currentUser.uid, courseId, rating, comment);
      
      toast.success('Rating submitted successfully');
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate This Course</DialogTitle>
          <DialogDescription>
            {existingRating 
              ? `Update your rating for ${courseTitle}` 
              : `Share your experience with ${courseTitle}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">How would you rate this course?</p>
            <StarRating 
              size="lg" 
              initialRating={rating} 
              onChange={handleRatingChange}
              className="mb-1"
            />
            <p className="text-sm font-medium mt-1">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>
          
          <div className="w-full">
            <label htmlFor="comment" className="text-sm text-gray-500 mb-2 block">
              Share your thoughts (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="What did you like or dislike about this course?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseRatingModal;
