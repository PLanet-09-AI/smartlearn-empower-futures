
export interface Course {
  id: string;
  firebaseId?: string; // Added to store Firebase document ID separately
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  ratingCount?: number; // Number of ratings received
  students: number;
  instructor: string;
  thumbnail: string;
  content: CourseContent[];
  quiz: Quiz;
  status: 'draft' | 'published' | 'archived';
}

export interface CourseContent {
  id: string;
  title: string;
  type: 'text' | 'video' | 'pdf';
  duration: string;
  content: string;
  videoUrl?: string;
  url?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string; // Added to provide explanations for answers
}

export interface CourseRating {
  id?: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt?: any;
}

// New interfaces for the AI Quiz System

export interface QuizResult {
  id: string;
  userId: string;
  courseId: string;
  scenarioText: string;
  questionsJson: string;
  score: number;
  generatedAt: Date | any; // Firebase Timestamp or JS Date
  attemptedAt: Date | any | null; // Firebase Timestamp or JS Date
  isCompleted: boolean;
}

export interface QuizAnswer {
  id?: string;
  quizResultId: string;
  userId: string;
  questionId: string;
  selectedOptionId: number;
  isCorrect: boolean;
  submittedAt: Date | any; // Firebase Timestamp or JS Date
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  score: number;
  timeTaken: number; // milliseconds
  attemptedAt: Date;
}

export interface QuizSubmission {
  questions: {
    questionId: string;
    selectedOptionId: number;
  }[];
}

export interface QuizResultViewModel {
  score: number;
  selectedAnswers: Record<string, boolean>;
  explanations: Record<string, string>;
  correctAnswers: Record<string, string>;
  userAnswers: Record<string, string>;
  attemptedAt: Date;
}

export interface LecturerPromptConfig {
  customPrompt?: string;
  temperature?: number;
  isEnabled: boolean;
}

// Interfaces for Quiz Analytics

export interface QuizAnalytics {
  quizId: string;
  courseId: string;
  courseName: string;
  totalAttempts: number;
  averageScore: number;
  questionAnalytics: QuestionAnalytics[];
  attemptsByDate: Record<string, number>;
  scoreDistribution: ScoreDistribution;
  userResults: UserQuizResult[];
  lastUpdated?: any; // Firestore Timestamp or Date
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswerText: string;
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  optionCounts: Record<number, number>; // Count of each option selected
}

export interface ScoreDistribution {
  excellent: number; // 90-100%
  good: number;      // 70-89% 
  average: number;   // 50-69%
  poor: number;      // 0-49%
}

export interface UserQuizResult {
  userId: string;
  userName: string;
  score: number;
  timeTaken: number;
  attemptedAt: Date | any;
  answers: {
    questionId: string;
    questionText: string;
    selectedOption: string;
    isCorrect: boolean;
    correctOption: string;
    explanation?: string;
  }[];
}
