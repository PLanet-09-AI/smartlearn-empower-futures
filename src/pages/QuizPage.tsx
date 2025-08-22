import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AIQuizGenerator from "@/components/AIQuizGenerator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { courseService } from "@/services/courseService";
import { Course } from "@/types";

const QuizPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleQuizComplete = (score: number) => {
    // Navigate back to course or dashboard after quiz completion
    navigate(`/course/${courseId}`, { 
      state: { quizCompleted: true, score } 
    });
  };

  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`);
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToCourse}
            className="text-gray-600 hover:text-gray-800"
          >
            {course.title}
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Quiz</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToCourse}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz: {course.title}
          </h1>
          <p className="text-gray-600">
            Test your knowledge with an AI-generated quiz based on the course content.
          </p>
        </div>

        {/* Quiz Component */}
        <div className="max-w-4xl mx-auto">
          <AIQuizGenerator
            courseId={courseId!}
            courseTitle={course.title}
            onQuizComplete={handleQuizComplete}
            isLecturer={currentUser?.role === 'lecturer'}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
