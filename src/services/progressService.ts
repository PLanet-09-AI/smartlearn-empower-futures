import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
      // Create a reference to the user's progress document
      const progressRef = doc(db, "userProgress", `${userId}_${courseId}`);
      
      // Check if the progress document exists
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        // Update existing progress
        const currentProgress = progressDoc.data() as UserProgress;
        const completedContent = currentProgress.completedContent || [];
        
        // Only add if not already marked as complete
        if (!completedContent.includes(contentId)) {
          // Calculate new completion percentage
          const course = await getDoc(doc(db, "courses", courseId));
          // Filter out quiz items from content when calculating total
          const totalContentCount = course.data()?.content?.filter(
            (item: any) => item.type !== 'quiz'
          )?.length || 1;
          const newCompletionPercentage = Math.min(
            ((completedContent.length + 1) / totalContentCount) * 100,
            100
          );
          
          // Update the progress document
          await updateDoc(progressRef, {
            completedContent: arrayUnion(contentId),
            lastAccessed: new Date(),
            completionPercentage: newCompletionPercentage
          });
        }
      } else {
        // Create new progress document
        const course = await getDoc(doc(db, "courses", courseId));
        // Filter out quiz items from content when calculating total
        const totalContentCount = course.data()?.content?.filter(
          (item: any) => item.type !== 'quiz'
        )?.length || 1;
        
        const newProgress: UserProgress = {
          userId,
          courseId,
          completedContent: [contentId],
          lastAccessed: new Date(),
          completionPercentage: (1 / totalContentCount) * 100
        };
        
        await setDoc(progressRef, newProgress);
      }
      
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },

  // Mark content as incomplete (if user wants to revisit)
  async markContentIncomplete(userId: string, courseId: string, contentId: string): Promise<void> {
    try {
      const progressRef = doc(db, "userProgress", `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentProgress = progressDoc.data() as UserProgress;
        
        // Calculate new completion percentage
        const course = await getDoc(doc(db, "courses", courseId));
        // Filter out quiz items from content when calculating total
        const totalContentCount = course.data()?.content?.filter(
          (item: any) => item.type !== 'quiz'
        )?.length || 1;
        const newCompletionPercentage = Math.max(
          ((currentProgress.completedContent.length - 1) / totalContentCount) * 100,
          0
        );
        
        await updateDoc(progressRef, {
          completedContent: arrayRemove(contentId),
          lastAccessed: new Date(),
          completionPercentage: newCompletionPercentage
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },

  // Get user's progress for a specific course
  async getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    try {
      const progressRef = doc(db, "userProgress", `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        return progressDoc.data() as UserProgress;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting progress:", error);
      throw error;
    }
  }
};
