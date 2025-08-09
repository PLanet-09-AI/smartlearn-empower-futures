
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
