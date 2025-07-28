import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { progressService, UserProgress } from "@/services/progressService";
import { Course } from "@/types";
import { CheckCircle, Clock, BarChart } from "lucide-react";
import { courseService } from "@/services/courseService";

const UserProgressDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [courseProgress, setCourseProgress] = useState<{course: Course, progress: UserProgress}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProgress = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // First, get all courses the user has enrolled in
        const courses = await courseService.getEnrolledCourses(currentUser.uid);
        
        // For each course, get the user's progress
        const progressPromises = courses.map(async (course) => {
          const courseId = course.firebaseId || course.id.toString();
          const progress = await progressService.getUserProgress(currentUser.uid, courseId);
          return { course, progress: progress || {
            userId: currentUser.uid,
            courseId,
            completedContent: [],
            lastAccessed: new Date(),
            completionPercentage: 0
          }};
        });
        
        const results = await Promise.all(progressPromises);
        setCourseProgress(results.filter(item => item.progress !== null));
      } catch (error) {
        console.error("Error loading user progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProgress();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8">Loading your progress...</div>;
  }

  if (courseProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>You haven't started any courses yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate overall progress
  const overallProgress = courseProgress.length > 0
    ? courseProgress.reduce((sum, { progress }) => sum + progress.completionPercentage, 0) / courseProgress.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Your Learning Progress</h2>
        
        {/* Overall progress card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-blue-800">Overall Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  You've completed {overallProgress.toFixed(0)}% of your enrolled courses
                </span>
                <span className="text-2xl font-bold text-blue-700">
                  {overallProgress.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-3 bg-blue-100" 
                className={`h-3 ${overallProgress > 80 ? 'bg-green-600' : 'bg-blue-600'}`}
              />
              
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
              </div>
              
              <div className="mt-2 text-center">
                {overallProgress === 0 ? (
                  <p className="text-gray-600">Start learning to track your progress!</p>
                ) : overallProgress < 30 ? (
                  <p className="text-blue-600">Keep going! You're making progress.</p>
                ) : overallProgress < 70 ? (
                  <p className="text-blue-600">Great work! You're steadily advancing.</p>
                ) : overallProgress < 100 ? (
                  <p className="text-green-600">Amazing progress! You're almost there!</p>
                ) : (
                  <p className="text-green-600">Congratulations! You've completed all your courses!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Course progress cards */}
      <h3 className="text-xl font-medium mt-8 mb-4">Course Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseProgress.map(({ course, progress }) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-40">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold">{progress.completionPercentage.toFixed(0)}%</h3>
                  <p>Complete</p>
                </div>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Last accessed: {
                  progress.lastAccessed instanceof Date
                    ? progress.lastAccessed.toLocaleDateString()
                    : new Date(progress.lastAccessed).toLocaleDateString()
                }</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Progress 
                value={progress.completionPercentage} 
                className={`mb-4 ${progress.completionPercentage === 100 ? 'bg-green-600' : undefined}`}
              />
              
              <div className="flex items-center justify-between text-sm">
                <span>
                  {progress.completedContent.length} / {
                    // Exclude quiz items from content count
                    course.content?.filter(content => content.type !== 'quiz')?.length || 0
                  } units completed
                </span>
                {progress.completionPercentage === 100 && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Completed!</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-4"
                variant={progress.completionPercentage === 100 ? "outline" : "default"}
                onClick={() => {
                  // Navigate to course content
                  window.location.href = `/course/${course.id}`;
                }}
              >
                {progress.completionPercentage === 0 ? 'Start Learning' : 
                 progress.completionPercentage === 100 ? 'Review Course' : 'Continue Learning'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserProgressDashboard;
