import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types";
import { ArrowLeft, BookOpen, Award, Sparkles } from "lucide-react";
import AIQuizGenerator from "./AIQuizGenerator";
import QuizLeaderboard from "./QuizLeaderboard";
import { useAuth } from "@/contexts/AuthContext";

interface CourseQuizSelectorProps {
  course: Course;
  onBack: () => void;
  userRole?: 'learner' | 'educator' | 'admin';
}

const CourseQuizSelector = ({ course, onBack, userRole = 'learner' }: CourseQuizSelectorProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("ai");
  
  const courseId = course.firebaseId || course.id;
  const hasStandardQuiz = course.quiz && course.quiz.questions && course.quiz.questions.length > 0;
  
  // Handle quiz completion
  const handleQuizComplete = (score: number) => {
    console.log(`Quiz completed with score: ${score}%`);
    // You could do additional things here like updating user progress
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Content
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            Content Quiz
          </TabsTrigger>
          <TabsTrigger value="standard" disabled={!hasStandardQuiz}>
            <BookOpen className="h-4 w-4 mr-2" />
            Standard Quiz
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Award className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="mt-6">
          <AIQuizGenerator
            courseId={courseId}
            courseTitle={course.title}
            onQuizComplete={handleQuizComplete}
          />
        </TabsContent>
        
        <TabsContent value="standard" className="mt-6">
          {hasStandardQuiz ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">{course.quiz.title}</h3>
              <p className="mb-4">This quiz contains {course.quiz.questions.length} questions created by the course instructor.</p>
              
              {/* This would be replaced with a proper quiz UI component */}
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-center text-gray-500">Standard quiz component would be displayed here</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-xl font-bold mb-4">No Standard Quiz Available</h3>
              <p>This course doesn't have an instructor-created quiz yet.</p>
              <p className="mt-2 text-gray-500">Try the AI-generated quiz instead!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-6">
          <QuizLeaderboard courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseQuizSelector;
