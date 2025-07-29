import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ArrowRight, Loader2, Star } from 'lucide-react';
import { Course } from '@/types';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CourseRatingModal from './CourseRatingModal';
import { StarRating } from '@/components/ui/star-rating';

interface CourseCompletionScreenProps {
  course: Course;
  onBack: () => void;
  onEnrollInCourse: (courseId: string) => void;
}

const CourseCompletionScreen: React.FC<CourseCompletionScreenProps> = ({
  course,
  onBack,
  onEnrollInCourse
}) => {
  const { currentUser } = useAuth();
  const [nextCourses, setNextCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(true);
  
  // Mark course as complete when the component loads
  useEffect(() => {
    const markCourseComplete = async () => {
      if (!currentUser || !course) return;
      
      try {
        // Update progress to 100%
        const progressRef = doc(db, "userProgress", `${currentUser.uid}_${course.firebaseId || course.id}`);
        await setDoc(progressRef, {
          userId: currentUser.uid,
          courseId: course.firebaseId || course.id,
          completedContent: course.content?.map(c => c.id) || [],
          lastAccessed: new Date(),
          completionPercentage: 100
        }, { merge: true });
        
        console.log(`Course ${course.title} marked as complete`);
      } catch (error) {
        console.error("Error marking course as complete:", error);
      }
    };

    markCourseComplete();
  }, [currentUser, course]);

  useEffect(() => {
    const fetchNextCourses = async () => {
      try {
        setLoading(true);
        // Get all courses to find the next one in sequence
        const allCourses = await courseService.getCourses('learner');
        
        // Extract module number from course title
        const getModuleNumber = (title: string) => {
          // Look for "Module X" pattern (case insensitive, allowing spaces)
          const moduleMatch = title.match(/module\s*(\d+)/i);
          if (moduleMatch) {
            return parseInt(moduleMatch[1], 10);
          }
          
          // Also look for "M1", "M2" patterns
          const shortMatch = title.match(/\bm(\d+)\b/i);
          if (shortMatch) {
            return parseInt(shortMatch[1], 10);
          }
          
          // Check for numeric prefixes
          const numericPrefixMatch = title.match(/^(\d+)[\s.\-_)]+/);
          if (numericPrefixMatch) {
            return parseInt(numericPrefixMatch[1], 10);
          }
          
          return 0;
        };
        
        // Get current course module number
        const currentModuleNumber = getModuleNumber(course.title);
        
        // Find the next module in sequence
        const nextModuleCourses = allCourses
          .filter(c => {
            const moduleNumber = getModuleNumber(c.title);
            // Find the course with the next module number
            return moduleNumber > currentModuleNumber && c.id !== course.id;
          })
          .sort((a, b) => {
            // Sort by module number
            return getModuleNumber(a.title) - getModuleNumber(b.title);
          })
          .slice(0, 3); // Get up to 3 next courses
        
        setNextCourses(nextModuleCourses);
      } catch (error) {
        console.error('Error fetching next courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextCourses();
  }, [course]);

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to enroll in a course');
      return;
    }
    
    try {
      setEnrollingCourseId(courseId);
      setEnrolling(true);
      
      // Check if user is already enrolled
      const enrollmentExists = await enrollmentService.checkEnrollmentExists(
        currentUser.uid,
        courseId
      );
      
      if (!enrollmentExists) {
        await enrollmentService.enrollUserInCourse(currentUser.uid, courseId);
        toast.success('Successfully enrolled in course!');
      } else {
        toast.info('You are already enrolled in this course');
      }
      
      // Navigate to the new course
      onEnrollInCourse(courseId);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CourseRatingModal
        isOpen={ratingModalOpen}
        setIsOpen={setRatingModalOpen}
        courseId={course.firebaseId || course.id}
        courseTitle={course.title}
      />
      
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="border-b border-green-200 bg-green-100">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle>Course Completed!</CardTitle>
          </div>
          <CardDescription>
            Congratulations on completing {course.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {currentUser?.email ? `Thank You, ${currentUser.email}!` : 'Thank You'} for Completing This Course
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You've successfully completed all sections of this course. 
              Your progress has been saved and is reflected on your profile.
            </p>
            
            <div className="mt-6">
              <Button 
                onClick={() => setRatingModalOpen(true)}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                Rate This Course
              </Button>
            </div>
          </div>

          {nextCourses.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Continue Your Learning Journey</h3>
              <div className="space-y-3">
                {nextCourses.map((nextCourse) => (
                  <Card key={nextCourse.id} className="border hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <h4 className="font-medium">{nextCourse.title}</h4>
                          {nextCourse.category && (
                            <Badge variant="outline" className="w-fit mt-1">
                              {nextCourse.category}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleEnroll(nextCourse.firebaseId || nextCourse.id)}
                          disabled={enrolling}
                        >
                          {enrolling && enrollingCourseId === (nextCourse.firebaseId || nextCourse.id) ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center my-6">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <p className="text-center text-gray-600">
              There are no additional courses available at this time.
            </p>
          )}

          <div className="flex justify-center mt-8">
            <Button onClick={onBack} variant="outline" className="mx-2">
              Return to Course Library
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCompletionScreen;
