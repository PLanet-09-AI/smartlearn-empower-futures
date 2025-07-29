
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
}

export interface CourseRating {
  id?: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt?: any;
}
