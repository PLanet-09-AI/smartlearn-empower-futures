import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseRating } from '@/types';

export class RatingService {
  private ratingsCollection = 'courseRatings';
  private coursesCollection = 'courses';

  // Add a new rating
  async addRating(
    userId: string,
    courseId: string,
    rating: number,
    comment?: string
  ): Promise<string> {
    try {
      // Check if the user has already rated this course
      const existingRating = await this.getUserRating(userId, courseId);
      
      if (existingRating) {
        // Update the existing rating
        await this.updateRating(existingRating.id!, rating, comment);
        return existingRating.id!;
      }

      // Create a new rating
      const ratingData: CourseRating = {
        userId,
        courseId,
        rating,
        comment: comment || '',
        createdAt: serverTimestamp(),
      };

      // Save the rating to Firebase
      const docRef = await addDoc(collection(db, this.ratingsCollection), ratingData);
      
      // Update the course's average rating
      await this.updateCourseAverageRating(courseId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw new Error('Failed to add rating');
    }
  }

  // Update an existing rating
  async updateRating(ratingId: string, rating: number, comment?: string): Promise<void> {
    try {
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      const ratingDoc = await getDoc(ratingRef);
      
      if (!ratingDoc.exists()) {
        throw new Error('Rating not found');
      }
      
      const ratingData = ratingDoc.data() as CourseRating;
      
      // Update the rating
      await updateDoc(ratingRef, {
        rating,
        comment: comment || ratingData.comment || '',
      });
      
      // Update the course's average rating
      await this.updateCourseAverageRating(ratingData.courseId);
    } catch (error) {
      console.error('Error updating rating:', error);
      throw new Error('Failed to update rating');
    }
  }

  // Get a user's rating for a specific course
  async getUserRating(userId: string, courseId: string): Promise<CourseRating | null> {
    try {
      const ratingsRef = collection(db, this.ratingsCollection);
      const q = query(
        ratingsRef,
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const ratingDoc = querySnapshot.docs[0];
      return {
        id: ratingDoc.id,
        ...ratingDoc.data() as CourseRating
      };
    } catch (error) {
      console.error('Error getting user rating:', error);
      throw new Error('Failed to get user rating');
    }
  }

  // Get all ratings for a course
  async getCourseRatings(courseId: string): Promise<CourseRating[]> {
    try {
      const ratingsRef = collection(db, this.ratingsCollection);
      const q = query(
        ratingsRef,
        where('courseId', '==', courseId)
      );
      
      const querySnapshot = await getDocs(q);
      const ratings: CourseRating[] = [];
      
      querySnapshot.forEach((doc) => {
        ratings.push({
          id: doc.id,
          ...doc.data() as CourseRating
        });
      });
      
      return ratings;
    } catch (error) {
      console.error('Error getting course ratings:', error);
      throw new Error('Failed to get course ratings');
    }
  }

  // Calculate and update the average rating for a course
  async updateCourseAverageRating(courseId: string): Promise<number> {
    try {
      // Get all ratings for the course
      const ratings = await this.getCourseRatings(courseId);
      const ratingCount = ratings.length;
      
      if (ratingCount === 0) {
        // No ratings, set default values
        await this.setCourseRatingData(courseId, 0, 0);
        return 0;
      }
      
      // Calculate average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratingCount;
      const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
      
      // Update the course's rating field and rating count
      await this.setCourseRatingData(courseId, roundedRating, ratingCount);
      
      return roundedRating;
    } catch (error) {
      console.error('Error updating course average rating:', error);
      throw new Error('Failed to update course average rating');
    }
  }

  // Set a course's rating value and count
  private async setCourseRatingData(courseId: string, rating: number, ratingCount: number): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      await updateDoc(courseRef, { rating, ratingCount });
    } catch (error) {
      console.error('Error setting course rating data:', error);
      throw new Error('Failed to set course rating data');
    }
  }

  // Delete a rating
  async deleteRating(ratingId: string): Promise<void> {
    try {
      // Get the rating to get the courseId
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      const ratingDoc = await getDoc(ratingRef);
      
      if (!ratingDoc.exists()) {
        throw new Error('Rating not found');
      }
      
      const ratingData = ratingDoc.data() as CourseRating;
      const courseId = ratingData.courseId;
      
      // Delete the rating
      await deleteDoc(ratingRef);
      
      // Update the course's average rating
      await this.updateCourseAverageRating(courseId);
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw new Error('Failed to delete rating');
    }
  }
}

export const ratingService = new RatingService();
