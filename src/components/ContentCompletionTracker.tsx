import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { progressService } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ContentCompletionTrackerProps {
  courseId: string;
  contentId: string;
  onCompletionChange?: (completed: boolean) => void;
}

const ContentCompletionTracker: React.FC<ContentCompletionTrackerProps> = ({ 
  courseId, 
  contentId,
  onCompletionChange
}) => {
  const { currentUser } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // Load completion status when component mounts
    const loadCompletionStatus = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const progress = await progressService.getUserProgress(
          currentUser.uid, 
          courseId
        );
        
        if (progress && progress.completedContent) {
          const isCompleted = progress.completedContent.includes(contentId);
          setCompleted(isCompleted);
          setPercentage(progress.completionPercentage || 0);
          if (onCompletionChange) {
            onCompletionChange(isCompleted);
          }
        }
      } catch (error) {
        console.error("Error loading completion status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompletionStatus();
  }, [currentUser, courseId, contentId, onCompletionChange]);

  const handleMarkComplete = async () => {
    if (!currentUser) {
      toast.error("Please sign in to track your progress");
      return;
    }
    
    setLoading(true);
    try {
      await progressService.markContentComplete(
        currentUser.uid,
        courseId,
        contentId
      );
      
      setCompleted(true);
      toast.success("Progress saved!");
      
      // Get updated progress percentage
      const updatedProgress = await progressService.getUserProgress(
        currentUser.uid,
        courseId
      );
      
      if (updatedProgress) {
        setPercentage(updatedProgress.completionPercentage || 0);
      }
      
      if (onCompletionChange) {
        onCompletionChange(true);
      }
    } catch (error) {
      console.error("Error marking content as complete:", error);
      toast.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkIncomplete = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await progressService.markContentIncomplete(
        currentUser.uid,
        courseId,
        contentId
      );
      
      setCompleted(false);
      toast.success("Progress updated");
      
      // Get updated progress percentage
      const updatedProgress = await progressService.getUserProgress(
        currentUser.uid,
        courseId
      );
      
      if (updatedProgress) {
        setPercentage(updatedProgress.completionPercentage || 0);
      }
      
      if (onCompletionChange) {
        onCompletionChange(false);
      }
    } catch (error) {
      console.error("Error marking content as incomplete:", error);
      toast.error("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Progress value={percentage} className="w-32" />
        <span className="text-sm font-medium">{percentage.toFixed(0)}% complete</span>
      </div>
      
      {completed ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkIncomplete}
          disabled={loading}
          className="w-full sm:w-auto flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Completed!
          <RefreshCw className="h-3 w-3 ml-1" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkComplete}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Mark as Complete
        </Button>
      )}
    </div>
  );
};

export default ContentCompletionTracker;
