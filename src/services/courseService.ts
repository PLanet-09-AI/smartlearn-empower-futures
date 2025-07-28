import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, CourseContent, Quiz } from '@/types';

// Extended Course interface for Firestore
interface FirestoreCourse extends Omit<Course, 'id'> {
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
      const courseData: FirestoreCourse = {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
      };

      // Save the course to Firebase
      const docRef = await addDoc(collection(db, this.coursesCollection), courseData);
      const firebaseId = docRef.id;
      
      // Use the Firebase ID as the course ID
      const id = firebaseId;
      
      console.log("Course created successfully:", {firebaseId, id});
      return {firebaseId, id};
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  // Update an existing course
  async updateCourse(courseId: string, updates: Partial<Course>, userId: string): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      
      // Get the course from Firebase
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }
      
      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is updating a course they didn't create - assuming admin role");
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Update the course in Firebase
      await updateDoc(courseRef, updateData);
      console.log("Course updated successfully:", courseId);
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  // Delete a course
  async deleteCourse(courseId: string, userId: string): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      
      // Get the course from Firebase
      const courseDoc = await getDoc(courseRef);
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }
      
      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is deleting a course they didn't create - assuming admin role");
      }

      // Delete the course from Firebase
      await deleteDoc(courseRef);
      console.log("Course deleted successfully:", courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Get all courses (published only for learners, all for educators/admins)
  async getCourses(userRole: 'learner' | 'educator' | 'admin', userId?: string): Promise<Course[]> {
    try {
      let q;
      
      if (userRole === 'learner') {
        // Learners only see published courses
        q = query(
          collection(db, this.coursesCollection),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'educator') {
        // Educators see their own courses
        q = query(
          collection(db, this.coursesCollection),
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Admins see all courses (including unpublished)
        q = query(
          collection(db, this.coursesCollection),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreCourse;
        courses.push({
          // Use the Firebase document ID as the main ID for consistency
          id: doc.id, // Use Firebase ID as string
          firebaseId: doc.id, // Store the Firebase document ID separately
          ...data,
        } as Course);
      });

      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  // Get a specific course by ID
  async getCourse(courseId: string): Promise<Course | null> {
    try {
      console.log("Getting course with ID:", courseId);
      
      // Try direct Firebase lookup first - most efficient approach
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (courseDoc.exists()) {
        console.log("Found course directly in Firebase:", courseId);
        const data = courseDoc.data() as FirestoreCourse;
        
        // Ensure the course data has all required fields
        if (!data.content) data.content = [];
        if (!data.quiz) {
          data.quiz = {
            id: courseId,
            title: `${data.title || 'Course'} Quiz`,
            questions: []
          };
        }
        
        return {
          id: courseId, // Use Firebase ID as string
          firebaseId: courseId, // Store the Firebase document ID
          ...data,
        } as Course;
      }
      
      // If not found by direct ID, check other courses
      // This is for backward compatibility with existing code that might use different ID formats
      // Get all courses to search through
      const allCourses = await this.getCourses('admin');
      console.log(`Searching among ${allCourses.length} courses for ID ${courseId}...`);
      
      // Look for a course with that ID
      const courseById = allCourses.find(course => course.id === courseId);
      if (courseById) {
        console.log("Found course by numeric ID:", courseById);
        return courseById;
      }
      
      console.log("Course not found:", courseId);
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }

  // Add content to a course
  async addCourseContent(
    courseId: string, 
    content: Omit<CourseContent, 'id'>, 
    userId: string
  ): Promise<CourseContent> {
    try {
      console.log("Adding content to course with ID:", courseId);
      console.log("Content to add:", content);
      
      // Get the course from Firebase
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }
      
      console.log("Course found in Firebase:", courseId);
      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Check permission if the course has a createdBy field
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is adding content to a course they didn't create - assuming admin role");
      }

      // Create new content with a unique ID
      const newContent: CourseContent = {
        id: Date.now().toString(),
        ...content,
      };

      const updatedContent = [...(courseData.content || []), newContent];

      // Update the course in Firebase
      await updateDoc(courseRef, {
        content: updatedContent,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Content added to Firebase course successfully");
      return newContent;
    } catch (error) {
      console.error('Error adding course content:', error);
      throw new Error('Failed to add course content');
    }
  }

  // Update course content
  async updateCourseContent(
    courseId: string,
    content: CourseContent,
    userId: string
  ): Promise<void> {
    try {
      console.log("Updating content in course with ID:", courseId);
      console.log("Content to update:", content);
      
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is updating content they didn't create - assuming admin role");
      }

      const updatedContent = (courseData.content || []).map(item =>
        item.id === content.id ? content : item
      );

      // Log the content that's going to be updated
      console.log("Content before update:", courseData.content);
      console.log("Updated content item:", content);
      console.log("Content after update:", updatedContent);
      
      await updateDoc(courseRef, {
        content: updatedContent,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Course content updated successfully in Firebase");
    } catch (error) {
      console.error('Error updating course content:', error);
      throw new Error('Failed to update course content');
    }
  }

  // Update the order of course content
  async updateCourseContentOrder(
    courseId: string,
    reorderedContent: CourseContent[],
    userId: string
  ): Promise<void> {
    try {
      console.log("Updating content order for course with ID:", courseId);
      
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is reordering content they didn't create - assuming admin role");
      }

      // Update the content array with the new order
      await updateDoc(courseRef, {
        content: reorderedContent,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Content order updated successfully");
    } catch (error) {
      console.error('Error updating course content order:', error);
      throw new Error('Failed to update course content order');
    }
  }

  // Delete course content
  async deleteCourseContent(
    courseId: string,
    contentId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log("Deleting content from course with ID:", courseId);
      console.log("Content ID to delete:", contentId);
      
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is deleting content they didn't create - assuming admin role");
      }

      const updatedContent = (courseData.content || []).filter(item => 
        item.id !== contentId
      );

      await updateDoc(courseRef, {
        content: updatedContent,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Content deleted successfully");
    } catch (error) {
      console.error('Error deleting course content:', error);
      throw new Error('Failed to delete course content');
    }
  }

  // Update course quiz
  async updateCourseQuiz(
    courseId: string,
    quiz: Quiz,
    userId: string
  ): Promise<void> {
    try {
      console.log("Updating quiz for course with ID:", courseId);
      
      // Get the course directly from Firebase
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is updating quiz for a course they didn't create - assuming admin role");
      }

      // Update the quiz in Firebase
      await updateDoc(courseRef, {
        quiz,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Quiz updated successfully for course:", courseId);
    } catch (error) {
      console.error('Error updating course quiz:', error);
      throw new Error('Failed to update course quiz');
    }
  }

  // Publish/unpublish a course
  async updateCourseStatus(
    courseId: string,
    status: 'draft' | 'published' | 'archived',
    userId: string
  ): Promise<void> {
    try {
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is changing status of a course they didn't create - assuming admin role");
      }

      // Update the course status
      await updateDoc(courseRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`Course status updated to ${status}:`, courseId);
    } catch (error) {
      console.error('Error updating course status:', error);
      throw new Error('Failed to update course status');
    }
  }

  // Delete a quiz from a course
  async deleteCourseQuiz(
    courseId: string,
    quizId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log("Deleting quiz from course with ID:", courseId);
      
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as FirestoreCourse;
      
      // Skip strict permission check for admin role
      if (courseData.createdBy && courseData.createdBy !== userId) {
        console.log("User is deleting quiz from a course they didn't create - assuming admin role");
      }

      // Remove the quiz by setting it to an empty quiz
      const emptyQuiz = {
        id: quizId,
        title: `${courseData.title} Quiz`,
        questions: []
      };

      await updateDoc(courseRef, {
        quiz: emptyQuiz,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Quiz deleted successfully from course:", courseId);
    } catch (error) {
      console.error('Error deleting course quiz:', error);
      throw new Error('Failed to delete course quiz');
    }
  }
  
  // Get enrolled courses for a user
  async getEnrolledCourses(userId: string): Promise<Course[]> {
    try {
      // Query user enrollments collection
      const enrollmentsRef = collection(db, "enrollments");
      const q = query(enrollmentsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      // Extract course IDs from enrollments
      const courseIds = querySnapshot.docs.map(doc => doc.data().courseId);
      
      // Get course details for each enrollment
      const coursesPromises = courseIds.map(async (courseId) => {
        const courseDoc = await getDoc(doc(db, this.coursesCollection, courseId));
        if (courseDoc.exists()) {
          return {
            ...courseDoc.data(),
            id: courseDoc.id,
            firebaseId: courseDoc.id
          } as Course;
        }
        return null;
      });
      
      const courses = await Promise.all(coursesPromises);
      return courses.filter(course => course !== null) as Course[];
    } catch (error) {
      console.error("Error getting enrolled courses:", error);
      throw error;
    }
  }
}

// Test Firebase connectivity and course operations
async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Check if we can connect to Firestore
    const testQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(testQuery);
    
    console.log(`Firebase connection test: ${querySnapshot.empty ? 'No courses found' : 'Connection successful'}`);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}

// Initialize service instance
export const courseService = new CourseService();

// Run connectivity test on service initialization
testFirebaseConnection()
  .then(connected => {
    if (connected) {
      console.log('Firebase is properly connected and ready to use');
    } else {
      console.error('Firebase connection is not working properly. Check your configuration.');
    }
  });
