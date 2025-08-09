  import React, { useState, useEffect, lazy, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, FileText, CheckCircle, Clock, Award, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { speakText, stopSpeaking, isSpeechSupported } from "@/utils/textToSpeech";
import { Course } from "@/types";
import { courseService } from "@/services/courseService";
import { useAuth } from "@/contexts/AuthContext";
import { progressService } from "@/services/progressService";
import ContentCompletionTracker from "@/components/ContentCompletionTracker";
import CourseQuizSelector from "@/components/CourseQuizSelector";

interface CourseContentProps {
  courseId: string;
  onBack: () => void;
  userRole: 'learner' | 'educator' | 'admin';
}

const CourseContent = ({ courseId, onBack, userRole }: CourseContentProps) => {
  const { currentUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Fetch course data from Firebase
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        console.log("Fetching course with ID:", courseId);
        
        // Get all courses first to have the complete set with both ID types
        const allCourses = await courseService.getCourses('admin');
        console.log("All available courses:", allCourses.length);
        
        // First try to find the course by numeric ID
        let fetchedCourse = allCourses.find(c => c.id === courseId);
        
        if (fetchedCourse) {
          console.log("Course found by numeric ID:", fetchedCourse.title);
          setCourse(fetchedCourse);
        } else {
          // Try by string ID
          const idAsString = courseId.toString();
          fetchedCourse = allCourses.find(c => c.firebaseId === idAsString);
          
          if (fetchedCourse) {
            console.log("Course found by Firebase ID:", fetchedCourse);
            setCourse(fetchedCourse);
          } else {
            // As a last resort, try direct lookup by ID
            console.log("Course not found in loaded courses. Trying direct lookup...");
            fetchedCourse = await courseService.getCourse(idAsString);
            
            if (fetchedCourse) {
              console.log("Course fetched successfully via direct lookup:", fetchedCourse);
              setCourse(fetchedCourse);
            } else {
              console.error("Course not found with ID:", courseId);
              setError('Course not found. Please check that the course exists.');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-medium">Loading course content...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || "Course not found"}</h2>
          <Button onClick={onBack}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  // These computed values need to be safely accessed since course might be null at first
  const currentContent = course?.content && course.content.length > 0 ? 
    course.content[currentContentIndex] : null;
  const progress = course?.content && course.content.length > 0 ?
    (completedContent.length / course.content.length) * 100 : 0;
  const speechSupported = isSpeechSupported();

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text);
      setIsSpeaking(true);
      
      // Reset speaking state when speech ends
      setTimeout(() => {
        setIsSpeaking(false);
      }, text.length * 50); // Rough estimate of speech duration
    }
  };

  const markContentComplete = async () => {
    if (currentContent && !completedContent.includes(currentContent.id) && currentUser) {
      const newCompletedContent = [...completedContent, currentContent.id];
      setCompletedContent(newCompletedContent);
      
      // Save progress to Firebase
      try {
        await progressService.markContentComplete(
          currentUser.uid,
          course?.firebaseId || courseId,
          currentContent.id.toString()
        );
        console.log("Progress saved to Firebase");
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const nextContent = () => {
    markContentComplete();
    if (course?.content && currentContentIndex < course.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
      setVideoEnded(false);
    } else {
      setShowQuiz(true);
    }
  };

  const prevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
      setVideoEnded(false);
    }
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    markContentComplete();
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleEnrollInCourse = (courseId: string) => {
    // Navigate to the enrolled course
    onBack(); // First go back to courses
    // After a brief delay, navigate to the new course
    setTimeout(() => {
      if (course) {
        window.dispatchEvent(new CustomEvent('course-selected', { detail: courseId }));
      }
    }, 100);
  };

  // Display our new AI-powered Quiz Selector for all user types
  if (showQuiz) {
    if (currentUser && course && course.content && completedContent.length === course.content.length) {
      // Ensure the course is marked as fully completed in the database
      // This is handled in the CourseCompletionScreen component or quizService
    }
    
    // Use our new CourseQuizSelector component
    return (
      <CourseQuizSelector
        course={course}
        onBack={() => setShowQuiz(false)}
        userRole={userRole}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Badge variant="secondary">{course?.category}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Course Progress</CardTitle>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-600">
                {completedContent.length} of {course?.content?.length || 0} completed
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {course?.content && course.content.map((content, index) => (
                <button
                  key={content.id}
                  className={`flex items-center w-full text-left space-x-2 p-2 rounded cursor-pointer text-sm ${
                    index === currentContentIndex ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setCurrentContentIndex(index);
                    setVideoEnded(false);
                  }}
                >
                  {content.type === 'video' ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="flex-1 truncate">{content.title}</span>
                  {completedContent.includes(content.id) && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </button>
              ))}
              
              <button
                className={`flex items-center w-full text-left space-x-2 p-2 rounded text-sm ${
                  showQuiz ? 'bg-green-100 text-green-700' : 'hover:bg-gray-50'
                } ${completedContent.length < (course?.content?.length || 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (course?.content && completedContent.length === course.content.length) {
                    setShowQuiz(true);
                  }
                }}
                disabled={course?.content ? completedContent.length < course.content.length : true}
                aria-label={course?.content && completedContent.length < course.content.length ? 
                  "Complete all sections before finishing the course" : "Take Course Quiz"}
                title={course?.content && completedContent.length < course.content.length ? 
                  "Complete all sections before finishing the course" : "Take Course Quiz"}
              >
                <Award className="h-4 w-4" />
                <span>Course Quiz</span>
                {quizCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentContent?.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {speechSupported && currentContent?.type === 'text' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak(`${currentContent.title}. ${currentContent.content}`)}
                      title="Listen to content"
                    >
                      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  )}
                  {currentContent?.type === 'video' ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {currentContent?.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentContent.duration}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentContent ? (
                currentContent?.type === 'video' ? (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={currentContent?.videoUrl}
                      title={currentContent?.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        // Mark video as completed after a delay to simulate watching
                        setTimeout(() => {
                          handleVideoEnded();
                        }, 2000);
                      }}
                    ></iframe>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        {speechSupported && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeak(currentContent?.content || "")}
                            title="Listen to this content"
                          >
                            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            <span className="ml-1 text-xs">Listen</span>
                          </Button>
                        )}
                      </div>
                      <div className="prose max-w-none text-gray-700 leading-relaxed">
                        {currentContent?.content && (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkRehype]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {typeof currentContent.content === 'string' ? currentContent.content : String(currentContent.content)}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p>No content available</p>
                </div>
              )}
              
              {currentContent && (
                <div className="mt-4 border-t pt-4">
                  <ContentCompletionTracker 
                    courseId={course?.firebaseId || courseId}
                    contentId={currentContent.id.toString()}
                    onCompletionChange={(completed) => {
                      // Update local state when completion status changes
                      if (completed && !completedContent.includes(currentContent.id)) {
                        setCompletedContent([...completedContent, currentContent.id]);
                      } else if (!completed && completedContent.includes(currentContent.id)) {
                        setCompletedContent(completedContent.filter(id => id !== currentContent.id));
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevContent}
                  disabled={currentContentIndex === 0}
                >
                  Previous
                </Button>
                
                  {course?.content && course.content.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {currentContentIndex + 1} of {course.content.length}
                  </span>
                )}                <Button 
                  onClick={nextContent}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !currentContent || 
                    (currentContent.type === 'video' && 
                    !videoEnded && 
                    !completedContent.includes(currentContent.id))
                  }
                >
                  {course.content && currentContentIndex === course.content.length - 1 
                    ? (
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-1" />
                        <span>Take Content Quiz</span>
                      </div>
                    ) 
                    : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
