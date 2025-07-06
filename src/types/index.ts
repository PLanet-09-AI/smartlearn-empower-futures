
export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students: number;
  instructor: string;
  thumbnail: string;
  content: CourseContent[];
  quiz: Quiz;
  status: 'draft' | 'published' | 'archived';
}

export interface CourseContent {
  id: number;
  title: string;
  type: 'text' | 'video' | 'pdf';
  duration: string;
  content: string;
  videoUrl?: string;
  url?: string;
}

export interface Quiz {
  id: number;
  title: string;
  courseId?: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}
