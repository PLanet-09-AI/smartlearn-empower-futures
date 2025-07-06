
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
  type: 'text' | 'video';
  duration: string;
  content: string;
  videoUrl?: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}
