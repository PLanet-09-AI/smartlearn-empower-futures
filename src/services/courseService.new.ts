import { db, serverTimestamp } from '@/lib/database';
import { Course, CourseContent, Quiz } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Extended Course interface for IndexedDB
interface DatabaseCourse extends Omit<Course, 'id'> {
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string; // User ID of the creator
}

export class CourseService {
  private coursesCollection = 'courses';
  private quizzesCollection = 'quizzes';

  // Create a new course
  async createCourse(course: Omit<Course, 'id'>, userId: string): Promise<{firebaseId: string, id: string}> {
    try {
      const courseData: DatabaseCourse = {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
      };

      // Save the course to IndexedDB
      const id = await db.add(this.coursesCollection, courseData);
      
      console.log("Course created successfully:", {firebaseId: id, id});
      return {firebaseId: id, id};
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  // Update an existing course
  async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    try {
      const existingCourse = await db.get(this.coursesCollection, courseId);
      
      if (!existingCourse) {
        throw new Error('Course not found');
      }

      const updatedCourse = {
        ...existingCourse,
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await db.update(this.coursesCollection, updatedCourse);
      console.log("Course updated successfully:", courseId);
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  // Delete a course
  async deleteCourse(courseId: string): Promise<void> {
    try {
      await db.delete(this.coursesCollection, courseId);
      console.log("Course deleted successfully:", courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Get all courses
  async getCourses(filters?: {
    category?: string;
    level?: string;
    status?: string;
    limit?: number;
  }): Promise<Course[]> {
    try {
      let courses = await db.getAll(this.coursesCollection);
      
      // Apply filters
      if (filters) {
        if (filters.category) {
          courses = courses.filter((course: any) => course.category === filters.category);
        }
        if (filters.level) {
          courses = courses.filter((course: any) => course.level === filters.level);
        }
        if (filters.status) {
          courses = courses.filter((course: any) => course.status === filters.status);
        }
        if (filters.limit) {
          courses = courses.slice(0, filters.limit);
        }
      }
      
      return courses.map((course: any) => ({
        ...course,
        id: course.id
      }));
    } catch (error) {
      console.error('Error getting courses:', error);
      throw new Error('Failed to get courses');
    }
  }

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return this.getCourses({ category });
  }

  // Get courses by level
  async getCoursesByLevel(level: string): Promise<Course[]> {
    return this.getCourses({ level });
  }

  // Get featured courses
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    try {
      const courses = await db.getAll(this.coursesCollection);
      
      // Sort by rating and return top courses
      const sortedCourses = courses
        .filter((course: any) => course.status === 'published')
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
      
      return sortedCourses.map((course: any) => ({
        ...course,
        id: course.id
      }));
    } catch (error) {
      console.error('Error getting featured courses:', error);
      throw new Error('Failed to get featured courses');
    }
  }

  // Get a single course by ID
  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const courseData = await db.get(this.coursesCollection, courseId);
      
      if (!courseData) {
        return null;
      }
      
      return {
        ...courseData,
        id: courseId
      };
    } catch (error) {
      console.error('Error getting course:', error);
      throw new Error('Failed to get course');
    }
  }

  // Search courses by title or description
  async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      const courses = await db.getAll(this.coursesCollection);
      
      const searchResults = courses.filter((course: any) => {
        const titleMatch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || descMatch;
      });
      
      return searchResults.map((course: any) => ({
        ...course,
        id: course.id
      }));
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('Failed to search courses');
    }
  }

  // Add content to a course
  async addCourseContent(courseId: string, content: Omit<CourseContent, 'id'>): Promise<string> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      const newContent: CourseContent = {
        ...content,
        id: uuidv4()
      };

      const updatedCourse = {
        ...course,
        content: [...(course.content || []), newContent],
        updatedAt: serverTimestamp()
      };

      await db.update(this.coursesCollection, updatedCourse);
      
      console.log("Content added to course:", courseId);
      return newContent.id;
    } catch (error) {
      console.error('Error adding course content:', error);
      throw new Error('Failed to add course content');
    }
  }

  // Update course content
  async updateCourseContent(courseId: string, contentId: string, updates: Partial<CourseContent>): Promise<void> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      const contentIndex = course.content?.findIndex((item: CourseContent) => item.id === contentId);
      if (contentIndex === -1) {
        throw new Error('Content not found');
      }

      const updatedContent = [...(course.content || [])];
      updatedContent[contentIndex] = { ...updatedContent[contentIndex], ...updates };

      const updatedCourse = {
        ...course,
        content: updatedContent,
        updatedAt: serverTimestamp()
      };

      await db.update(this.coursesCollection, updatedCourse);
      
      console.log("Course content updated:", contentId);
    } catch (error) {
      console.error('Error updating course content:', error);
      throw new Error('Failed to update course content');
    }
  }

  // Delete course content
  async deleteCourseContent(courseId: string, contentId: string): Promise<void> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      const updatedContent = course.content?.filter((item: CourseContent) => item.id !== contentId) || [];

      const updatedCourse = {
        ...course,
        content: updatedContent,
        updatedAt: serverTimestamp()
      };

      await db.update(this.coursesCollection, updatedCourse);
      
      console.log("Course content deleted:", contentId);
    } catch (error) {
      console.error('Error deleting course content:', error);
      throw new Error('Failed to delete course content');
    }
  }

  // Add/Update quiz for a course
  async updateCourseQuiz(courseId: string, quiz: Quiz): Promise<void> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      const updatedCourse = {
        ...course,
        quiz: quiz,
        updatedAt: serverTimestamp()
      };

      await db.update(this.coursesCollection, updatedCourse);
      
      console.log("Quiz updated for course:", courseId);
    } catch (error) {
      console.error('Error updating course quiz:', error);
      throw new Error('Failed to update course quiz');
    }
  }

  // Get quiz for a course
  async getCourseQuiz(courseId: string): Promise<Quiz | null> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course || !course.quiz) {
        return null;
      }
      
      return course.quiz;
    } catch (error) {
      console.error('Error getting course quiz:', error);
      throw new Error('Failed to get course quiz');
    }
  }

  // Update course rating
  async updateCourseRating(courseId: string, newRating: number, newRatingCount: number): Promise<void> {
    try {
      const course = await db.get(this.coursesCollection, courseId);
      
      if (!course) {
        throw new Error('Course not found');
      }

      const updatedCourse = {
        ...course,
        rating: newRating,
        ratingCount: newRatingCount,
        updatedAt: serverTimestamp()
      };

      await db.update(this.coursesCollection, updatedCourse);
      
      console.log("Course rating updated:", courseId);
    } catch (error) {
      console.error('Error updating course rating:', error);
      throw new Error('Failed to update course rating');
    }
  }

  // Get courses for a specific instructor
  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    try {
      const courses = await db.query(this.coursesCollection, 
        (course: any) => course.createdBy === instructorId
      );
      
      return courses.map((course: any) => ({
        ...course,
        id: course.id
      }));
    } catch (error) {
      console.error('Error getting instructor courses:', error);
      throw new Error('Failed to get instructor courses');
    }
  }

  // Get course statistics
  async getCourseStats(courseId: string): Promise<{
    enrollmentCount: number;
    completionCount: number;
    averageRating: number;
    totalRatings: number;
  }> {
    try {
      const enrollments = await db.query('enrollments', 
        (enrollment: any) => enrollment.courseId === courseId
      );
      
      const course = await db.get(this.coursesCollection, courseId);
      
      const completedEnrollments = enrollments.filter((enrollment: any) => enrollment.completed);
      
      return {
        enrollmentCount: enrollments.length,
        completionCount: completedEnrollments.length,
        averageRating: course?.rating || 0,
        totalRatings: course?.ratingCount || 0
      };
    } catch (error) {
      console.error('Error getting course stats:', error);
      throw new Error('Failed to get course stats');
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to get all courses (this will test if IndexedDB is working)
      await db.getAll(this.coursesCollection);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Get course categories (dynamic from existing courses)
  async getCourseCategories(): Promise<string[]> {
    try {
      const courses = await db.getAll(this.coursesCollection);
      const categories = [...new Set(courses.map((course: any) => course.category))];
      return categories.filter(Boolean);
    } catch (error) {
      console.error('Error getting course categories:', error);
      throw new Error('Failed to get course categories');
    }
  }

  // Batch create courses (useful for seeding)
  async batchCreateCourses(courses: Omit<Course, 'id'>[], userId: string): Promise<string[]> {
    try {
      const courseIds: string[] = [];
      
      for (const course of courses) {
        const result = await this.createCourse(course, userId);
        courseIds.push(result.id);
      }
      
      console.log(`Batch created ${courseIds.length} courses`);
      return courseIds;
    } catch (error) {
      console.error('Error batch creating courses:', error);
      throw new Error('Failed to batch create courses');
    }
  }
}

export const courseService = new CourseService();
