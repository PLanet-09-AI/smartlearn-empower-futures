import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, FileText, CheckCircle, Clock, Award, Volume2, VolumeX } from "lucide-react";
import { speakText, stopSpeaking, isSpeechSupported } from "@/utils/textToSpeech";
import { Course } from "@/types";
import { courses } from "@/data/courses";

interface CourseContentProps {
  courseId: number;
  onBack: () => void;
  userRole: 'learner' | 'educator' | 'admin';
}

const CourseContent = ({ courseId, onBack, userRole }: CourseContentProps) => {
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button onClick={onBack}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [completedContent, setCompletedContent] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const currentContent = course.content[currentContentIndex];
  const progress = (completedContent.length / course.content.length) * 100;
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

  const markContentComplete = () => {
    if (!completedContent.includes(currentContent.id)) {
      setCompletedContent([...completedContent, currentContent.id]);
    }
  };

  const nextContent = () => {
    markContentComplete();
    if (currentContentIndex < course.content.length - 1) {
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

  const submitQuiz = () => {
    let correct = 0;
    course.quiz.questions.forEach((question: any, index: number) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / course.quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizCompleted(true);
  };

  const canSubmitQuiz = quizAnswers.length === course.quiz.questions.length;

  if (showQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setShowQuiz(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <Badge variant="secondary">Quiz</Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                {course.quiz.title}
              </CardTitle>
              {speechSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSpeak(`Quiz: ${course.quiz.title}. Test your knowledge of the course material.`)}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <CardDescription>
              Test your knowledge of the course material
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!quizCompleted ? (
              <>
                {course.quiz.questions.map((question: any, questionIndex: number) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Question {questionIndex + 1}: {question.question}
                      </h3>
                      {speechSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeak(`Question ${questionIndex + 1}: ${question.question}. ${question.options.join('. ')}`)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <label 
                          key={optionIndex}
                          className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                            className="text-blue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={submitQuiz} 
                  disabled={!canSubmitQuiz}
                  className="w-full"
                >
                  Submit Quiz
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-6xl">
                  {quizScore >= 70 ? "🎉" : "📚"}
                </div>
                <h3 className="text-2xl font-bold">
                  Quiz Complete!
                </h3>
                <p className="text-lg">
                  Your Score: <span className="font-bold text-blue-600">{quizScore}%</span>
                </p>
                {quizScore >= 70 ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">Congratulations! You passed!</p>
                    <div className="flex items-center justify-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-500" />
                      <span>Certificate earned</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-orange-600">
                    You need 70% to pass. Review the content and try again!
                  </p>
                )}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => {
                    setQuizCompleted(false);
                    setQuizAnswers([]);
                    setQuizScore(0);
                  }}>
                    Retake Quiz
                  </Button>
                  <Button onClick={onBack}>
                    Back to Courses
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <Badge variant="secondary">{course.category}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Course Progress</CardTitle>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-600">
                {completedContent.length} of {course.content.length} completed
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.content.map((content: any, index: number) => (
                <div
                  key={content.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer text-sm ${
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
                </div>
              ))}
              
              <div
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer text-sm ${
                  showQuiz ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-50'
                } ${completedContent.length < course.content.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (completedContent.length === course.content.length) {
                    setShowQuiz(true);
                  }
                }}
              >
                <Award className="h-4 w-4" />
                <span>Final Quiz</span>
                {quizCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentContent.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {speechSupported && currentContent.type === 'text' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak(`${currentContent.title}. ${currentContent.content}`)}
                      title="Listen to content"
                    >
                      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  )}
                  {currentContent.type === 'video' ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {currentContent.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentContent.duration}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentContent.type === 'video' ? (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={currentContent.videoUrl}
                    title={currentContent.title}
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
                          onClick={() => handleSpeak(currentContent.content)}
                          title="Listen to this content"
                        >
                          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          <span className="ml-1 text-xs">Listen</span>
                        </Button>
                      )}
                    </div>
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {currentContent.content}
                    </div>
                  </div>
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
                
                <span className="text-sm text-gray-600">
                  {currentContentIndex + 1} of {course.content.length}
                </span>
                
                <Button 
                  onClick={nextContent}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={currentContent.type === 'video' && !videoEnded && !completedContent.includes(currentContent.id)}
                >
                  {currentContentIndex === course.content.length - 1 ? 'Take Quiz' : 'Next'}
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
