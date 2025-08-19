import { db, serverTimestamp } from "@/lib/database";

export interface UserProgress {
  userId: string;
  courseId: string;
  completedContent: string[]; // Array of content IDs that have been completed
  lastAccessed: Date;
  completionPercentage: number;
}

export const progressService = {
  // Save user's progress for a specific course content item
  async markContentComplete(userId: string, courseId: string, contentId: string): Promise<void> {
    try {
      // Create a unique progress ID
      const progressId = `${userId}_${courseId}`;
      
      // Check if the progress document exists
      const existingProgress = await db.get("userProgress", progressId);
      
      if (existingProgress) {
        // Update existing progress
        const currentProgress = existingProgress as UserProgress;
        const completedContent = currentProgress.completedContent || [];
        
        // Only add if not already marked as complete
        if (!completedContent.includes(contentId)) {
          // Calculate new completion percentage
          const course = await db.get("courses", courseId);
          // Filter out quiz items from content when calculating total
          const courseContent = course?.content || [];
          const totalContentItems = courseContent.length;
          const newCompletedCount = completedContent.length + 1;
          const newCompletionPercentage = totalContentItems > 0 
            ? Math.round((newCompletedCount / totalContentItems) * 100) 
            : 0;

          const updatedProgress = {
            ...currentProgress,
            completedContent: [...completedContent, contentId],
            lastAccessed: serverTimestamp(),
            completionPercentage: newCompletionPercentage
          };

          await db.update("userProgress", updatedProgress);
          console.log(`Progress updated for user ${userId} in course ${courseId}`);
        }
      } else {
        // Create new progress document
        const course = await db.get("courses", courseId);
        const courseContent = course?.content || [];
        const totalContentItems = courseContent.length;
        const completionPercentage = totalContentItems > 0 
          ? Math.round((1 / totalContentItems) * 100) 
          : 0;

        const newProgress: UserProgress = {
          userId,
          courseId,
          completedContent: [contentId],
          lastAccessed: serverTimestamp(),
          completionPercentage
        };

        await db.add("userProgress", { id: progressId, ...newProgress });
        console.log(`New progress created for user ${userId} in course ${courseId}`);
      }
    } catch (error) {
      console.error("Error marking content as complete:", error);
      throw new Error("Failed to mark content as complete");
    }
  },

  // Get user's progress for a specific course
  async getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      const progressId = `${userId}_${courseId}`;
      const progress = await db.get("userProgress", progressId);
      
      return progress ? progress as UserProgress : null;
    } catch (error) {
      console.error("Error getting user progress:", error);
      return null;
    }
  },

  // Mark content as incomplete (uncheck)
  async markContentIncomplete(userId: string, courseId: string, contentId: string): Promise<void> {
    try {
      const progressId = `${userId}_${courseId}`;
      const existingProgress = await db.get("userProgress", progressId);
      
      if (existingProgress) {
        const currentProgress = existingProgress as UserProgress;
        const completedContent = currentProgress.completedContent || [];
        
        // Remove the content ID if it exists
        const updatedCompletedContent = completedContent.filter(id => id !== contentId);
        
        // Recalculate completion percentage
        const course = await db.get("courses", courseId);
        const courseContent = course?.content || [];
        const totalContentItems = courseContent.length;
        const completionPercentage = totalContentItems > 0 
          ? Math.round((updatedCompletedContent.length / totalContentItems) * 100) 
          : 0;

        const updatedProgress = {
          ...currentProgress,
          completedContent: updatedCompletedContent,
          lastAccessed: serverTimestamp(),
          completionPercentage
        };

        await db.update("userProgress", updatedProgress);
        console.log(`Content ${contentId} marked as incomplete for user ${userId}`);
      }
    } catch (error) {
      console.error("Error marking content as incomplete:", error);
      throw new Error("Failed to mark content as incomplete");
    }
  },

  // Get all progress for a user across all courses
  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const allProgress = await db.query("userProgress", 
        (progress: any) => progress.userId === userId
      );
      
      return allProgress;
    } catch (error) {
      console.error("Error getting all user progress:", error);
      throw new Error("Failed to get user progress");
    }
  },

  // Check if specific content is completed
  async isContentCompleted(userId: string, courseId: string, contentId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId, courseId);
      
      if (!progress) return false;
      
      return progress.completedContent.includes(contentId);
    } catch (error) {
      console.error("Error checking if content is completed:", error);
      return false;
    }
  },

  // Get completion percentage for a course
  async getCourseCompletionPercentage(userId: string, courseId: string): Promise<number> {
    try {
      const progress = await this.getUserProgress(userId, courseId);
      
      return progress ? progress.completionPercentage : 0;
    } catch (error) {
      console.error("Error getting course completion percentage:", error);
      return 0;
    }
  },

  // Reset course progress
  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      const progressId = `${userId}_${courseId}`;
      await db.delete("userProgress", progressId);
      console.log(`Progress reset for user ${userId} in course ${courseId}`);
    } catch (error) {
      console.error("Error resetting course progress:", error);
      throw new Error("Failed to reset course progress");
    }
  }
};
