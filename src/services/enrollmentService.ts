import { db, serverTimestamp } from '@/lib/database';

export interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped';
}

export class EnrollmentService {
  private enrollmentsCollection = 'enrollments';

  // Enroll a user in a course
  async enrollUserInCourse(userId: string, courseId: string): Promise<string> {
    try {
      // Check if the user is already enrolled
      const existingEnrollment = await this.checkEnrollmentExists(userId, courseId);
      if (existingEnrollment) {
        return existingEnrollment; // Return existing enrollment ID
      }

      // Create new enrollment
      const enrollmentData = {
        userId,
        courseId,
        enrollmentDate: serverTimestamp(),
        status: 'active' as const
      };

      const enrollmentId = await db.add(this.enrollmentsCollection, enrollmentData);
      console.log('User enrolled successfully:', { userId, courseId, enrollmentId });
      return enrollmentId;
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw new Error('Failed to enroll user in course');
    }
  }

  // Check if enrollment exists for user and course
  async checkEnrollmentExists(userId: string, courseId: string): Promise<string | null> {
    try {
      const enrollments = await db.query(this.enrollmentsCollection, 
        (enrollment: any) => enrollment.userId === userId && enrollment.courseId === courseId
      );
      
      return enrollments.length > 0 ? enrollments[0].id : null;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return null;
    }
  }

  // Get all enrollments for a user
  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    try {
      const enrollments = await db.query(this.enrollmentsCollection,
        (enrollment: any) => enrollment.userId === userId
      );
      
      return enrollments;
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      throw new Error('Failed to get user enrollments');
    }
  }

  // Get all enrollments for a course
  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    try {
      const enrollments = await db.query(this.enrollmentsCollection,
        (enrollment: any) => enrollment.courseId === courseId
      );
      
      return enrollments;
    } catch (error) {
      console.error('Error getting course enrollments:', error);
      throw new Error('Failed to get course enrollments');
    }
  }

  // Get enrollment by ID
  async getEnrollment(enrollmentId: string): Promise<CourseEnrollment | null> {
    try {
      const enrollment = await db.get(this.enrollmentsCollection, enrollmentId);
      return enrollment || null;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      throw new Error('Failed to get enrollment');
    }
  }

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId: string, status: 'active' | 'completed' | 'dropped'): Promise<void> {
    try {
      const enrollment = await db.get(this.enrollmentsCollection, enrollmentId);
      
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const updatedEnrollment = {
        ...enrollment,
        status
      };

      await db.update(this.enrollmentsCollection, updatedEnrollment);
      console.log('Enrollment status updated:', { enrollmentId, status });
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      throw new Error('Failed to update enrollment status');
    }
  }

  // Remove enrollment (drop course)
  async removeEnrollment(enrollmentId: string): Promise<void> {
    try {
      await db.delete(this.enrollmentsCollection, enrollmentId);
      console.log('Enrollment removed:', enrollmentId);
    } catch (error) {
      console.error('Error removing enrollment:', error);
      throw new Error('Failed to remove enrollment');
    }
  }

  // Get enrollment statistics
  async getEnrollmentStats(): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    droppedEnrollments: number;
  }> {
    try {
      const allEnrollments = await db.getAll(this.enrollmentsCollection);
      
      const stats = {
        totalEnrollments: allEnrollments.length,
        activeEnrollments: allEnrollments.filter((e: any) => e.status === 'active').length,
        completedEnrollments: allEnrollments.filter((e: any) => e.status === 'completed').length,
        droppedEnrollments: allEnrollments.filter((e: any) => e.status === 'dropped').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting enrollment stats:', error);
      throw new Error('Failed to get enrollment statistics');
    }
  }

  // Check if user is enrolled in course
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollmentId = await this.checkEnrollmentExists(userId, courseId);
      return enrollmentId !== null;
    } catch (error) {
      console.error('Error checking if user is enrolled:', error);
      return false;
    }
  }

  // Get user's completed courses
  async getUserCompletedCourses(userId: string): Promise<string[]> {
    try {
      const enrollments = await db.query(this.enrollmentsCollection,
        (enrollment: any) => enrollment.userId === userId && enrollment.status === 'completed'
      );
      
      return enrollments.map((enrollment: any) => enrollment.courseId);
    } catch (error) {
      console.error('Error getting user completed courses:', error);
      throw new Error('Failed to get user completed courses');
    }
  }
}

export const enrollmentService = new EnrollmentService();
