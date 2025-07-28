import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

      // Check if the course exists
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      // Create the enrollment
      const enrollmentData: Omit<CourseEnrollment, 'id'> = {
        userId,
        courseId,
        enrollmentDate: new Date(),
        status: 'active'
      };

      // Add enrollment document to Firebase
      const docRef = await addDoc(
        collection(db, this.enrollmentsCollection), 
        {
          ...enrollmentData,
          enrollmentDate: serverTimestamp(),
        }
      );

      console.log(`User ${userId} enrolled in course ${courseId} successfully`);
      return docRef.id;
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      throw new Error('Failed to enroll in course');
    }
  }

  // Check if a user is already enrolled in a course
  async checkEnrollmentExists(userId: string, courseId: string): Promise<string | null> {
    try {
      const enrollmentsRef = collection(db, this.enrollmentsCollection);
      const q = query(
        enrollmentsRef, 
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User is already enrolled
        return querySnapshot.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      throw new Error('Failed to check enrollment status');
    }
  }

  // Get all courses a user is enrolled in
  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    try {
      const enrollmentsRef = collection(db, this.enrollmentsCollection);
      const q = query(enrollmentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const enrollments: CourseEnrollment[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        enrollments.push({
          userId: data.userId,
          courseId: data.courseId,
          enrollmentDate: data.enrollmentDate?.toDate() || new Date(),
          status: data.status || 'active'
        });
      });
      
      return enrollments;
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      throw new Error('Failed to get user enrollments');
    }
  }

  // Unenroll a user from a course
  async unenrollUserFromCourse(userId: string, courseId: string): Promise<void> {
    try {
      const enrollmentsRef = collection(db, this.enrollmentsCollection);
      const q = query(
        enrollmentsRef, 
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Enrollment not found');
      }
      
      // Get the enrollment document ID
      const enrollmentId = querySnapshot.docs[0].id;
      
      // Delete the enrollment document
      await deleteDoc(doc(db, this.enrollmentsCollection, enrollmentId));
      
      console.log(`User ${userId} unenrolled from course ${courseId} successfully`);
    } catch (error) {
      console.error('Error unenrolling user from course:', error);
      throw new Error('Failed to unenroll from course');
    }
  }
}

export const enrollmentService = new EnrollmentService();
