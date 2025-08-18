import { db, serverTimestamp } from '@/lib/database';
import { CourseRating } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
        // Update existing rating
        return await this.updateRating(existingRating.id!, rating, comment);
      }

      // Create new rating
      const ratingData: CourseRating = {
        id: uuidv4(),
        userId,
        courseId,
        rating,
        comment,
        createdAt: serverTimestamp()
      };

      const ratingId = await db.add(this.ratingsCollection, ratingData);
      
      // Update course rating statistics
      await this.updateCourseRatingStats(courseId);
      
      console.log('Rating added successfully:', ratingId);
      return ratingId;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw new Error('Failed to add rating');
    }
  }

  // Update an existing rating
  async updateRating(
    ratingId: string,
    rating: number,
    comment?: string
  ): Promise<string> {
    try {
      const existingRating = await db.get(this.ratingsCollection, ratingId);
      
      if (!existingRating) {
        throw new Error('Rating not found');
      }

      const updatedRating = {
        ...existingRating,
        rating,
        comment,
        updatedAt: serverTimestamp()
      };

      await db.update(this.ratingsCollection, updatedRating);
      
      // Update course rating statistics
      await this.updateCourseRatingStats(existingRating.courseId);
      
      console.log('Rating updated successfully:', ratingId);
      return ratingId;
    } catch (error) {
      console.error('Error updating rating:', error);
      throw new Error('Failed to update rating');
    }
  }

  // Get a user's rating for a specific course
  async getUserRating(userId: string, courseId: string): Promise<CourseRating | null> {
    try {
      const ratings = await db.query(this.ratingsCollection, 
        (rating: any) => rating.userId === userId && rating.courseId === courseId
      );
      
      return ratings.length > 0 ? ratings[0] : null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  }

  // Get all ratings for a course
  async getCourseRatings(courseId: string, limit?: number): Promise<CourseRating[]> {
    try {
      const ratings = await db.query(this.ratingsCollection,
        (rating: any) => rating.courseId === courseId
      );
      
      // Sort by creation date (newest first)
      const sortedRatings = ratings.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return limit ? sortedRatings.slice(0, limit) : sortedRatings;
    } catch (error) {
      console.error('Error getting course ratings:', error);
      throw new Error('Failed to get course ratings');
    }
  }

  // Get all ratings by a user
  async getUserRatings(userId: string): Promise<CourseRating[]> {
    try {
      const ratings = await db.query(this.ratingsCollection,
        (rating: any) => rating.userId === userId
      );
      
      return ratings.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user ratings:', error);
      throw new Error('Failed to get user ratings');
    }
  }

  // Delete a rating
  async deleteRating(ratingId: string): Promise<void> {
    try {
      const rating = await db.get(this.ratingsCollection, ratingId);
      
      if (!rating) {
        throw new Error('Rating not found');
      }

      await db.delete(this.ratingsCollection, ratingId);
      
      // Update course rating statistics
      await this.updateCourseRatingStats(rating.courseId);
      
      console.log('Rating deleted successfully:', ratingId);
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw new Error('Failed to delete rating');
    }
  }

  // Calculate and update course rating statistics
  private async updateCourseRatingStats(courseId: string): Promise<void> {
    try {
      const ratings = await this.getCourseRatings(courseId);
      
      if (ratings.length === 0) {
        // No ratings, set to default values
        const course = await db.get(this.coursesCollection, courseId);
        if (course) {
          const updatedCourse = {
            ...course,
            rating: 0,
            ratingCount: 0
          };
          await db.update(this.coursesCollection, updatedCourse);
        }
        return;
      }

      // Calculate average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;
      const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place

      // Update course with new rating statistics
      const course = await db.get(this.coursesCollection, courseId);
      if (course) {
        const updatedCourse = {
          ...course,
          rating: roundedRating,
          ratingCount: ratings.length
        };
        await db.update(this.coursesCollection, updatedCourse);
      }

      console.log(`Updated course ${courseId} rating stats:`, {
        averageRating: roundedRating,
        totalRatings: ratings.length
      });
    } catch (error) {
      console.error('Error updating course rating stats:', error);
    }
  }

  // Get rating statistics for a course
  async getCourseRatingStats(courseId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }> {
    try {
      const ratings = await this.getCourseRatings(courseId);
      
      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      // Calculate average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

      // Calculate rating distribution
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        if (rating.rating >= 1 && rating.rating <= 5) {
          distribution[Math.round(rating.rating)]++;
        }
      });

      return {
        averageRating,
        totalRatings: ratings.length,
        ratingDistribution: distribution
      };
    } catch (error) {
      console.error('Error getting course rating stats:', error);
      throw new Error('Failed to get course rating statistics');
    }
  }

  // Check if a user can rate a course (e.g., must be enrolled)
  async canUserRate(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if user is enrolled in the course
      const enrollments = await db.query('enrollments',
        (enrollment: any) => enrollment.userId === userId && enrollment.courseId === courseId
      );
      
      return enrollments.length > 0;
    } catch (error) {
      console.error('Error checking if user can rate course:', error);
      return false;
    }
  }

  // Get top-rated courses
  async getTopRatedCourses(limit: number = 10): Promise<any[]> {
    try {
      const courses = await db.getAll(this.coursesCollection);
      
      // Filter published courses with ratings and sort by rating
      const topCourses = courses
        .filter((course: any) => course.status === 'published' && course.rating > 0)
        .sort((a: any, b: any) => {
          // Sort by rating first, then by number of ratings
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return (b.ratingCount || 0) - (a.ratingCount || 0);
        })
        .slice(0, limit);

      return topCourses;
    } catch (error) {
      console.error('Error getting top-rated courses:', error);
      throw new Error('Failed to get top-rated courses');
    }
  }

  // Get recent ratings across all courses
  async getRecentRatings(limit: number = 20): Promise<CourseRating[]> {
    try {
      const allRatings = await db.getAll(this.ratingsCollection);
      
      // Sort by creation date (newest first) and limit
      const recentRatings = allRatings
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);

      return recentRatings;
    } catch (error) {
      console.error('Error getting recent ratings:', error);
      throw new Error('Failed to get recent ratings');
    }
  }
}

export const ratingService = new RatingService();
