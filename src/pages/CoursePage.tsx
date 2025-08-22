import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CourseContent from "@/components/CourseContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Trophy } from "lucide-react";
import { courseService } from "@/services/courseService";
import { Course } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user just completed a quiz
  const quizCompleted = location.state?.quizCompleted;
  const quizScore = location.state?.score;

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        navigate('/dashboard');
        return;
      }

      try {
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleTakeQuiz = () => {
    navigate(`/quiz/${courseId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!currentUser) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header 
          isLoggedIn={!!currentUser} 
          onLogout={logout}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header 
          isLoggedIn={!!currentUser} 
          onLogout={logout}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Not Found</h2>
            <Button onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        isLoggedIn={!!currentUser} 
        onLogout={logout}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:text-gray-800"
          >
            Dashboard
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{course.title}</span>
        </div>

        {/* Quiz Completion Alert */}
        {quizCompleted && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Trophy className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Quiz completed! You scored {quizScore}%. 
              {quizScore >= 70 ? " Great job!" : " Keep studying and try again!"}
            </AlertDescription>
          </Alert>
        )}

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                  <p className="text-gray-600">{course.description}</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleTakeQuiz}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Take Quiz
            </Button>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CourseContent 
            courseId={courseId!}
            onBack={handleBackToDashboard}
            userRole={currentUser.role === 'student' ? 'learner' : 
                     currentUser.role === 'lecturer' ? 'educator' : 'admin'}
          />
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
