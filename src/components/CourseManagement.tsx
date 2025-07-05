import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Users, Clock, BookOpen, FileQuestion, Video, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courses as initialCourses } from "@/data/courses";

interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf';
  content: string;
  order: number;
  videoId?: string; // YouTube video ID
}

interface Course {
  id: number;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  thumbnail: string;
  price?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  curriculum?: string[];
  status?: 'draft' | 'published' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
  content?: CourseContent[];
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  attempts: number;
  createdAt: Date;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

interface CourseManagementProps {
  userRole: 'educator' | 'admin';
  onCoursesUpdate?: (courses: Course[]) => void;
}

const CourseManagement = ({ userRole, onCoursesUpdate }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'content'>('courses');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: '',
    level: '',
    duration: '',
    instructor: '',
    thumbnail: '',
    price: 0,
    prerequisites: '',
    learningObjectives: '',
    curriculum: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    content: [] as CourseContent[]
  });

  const [contentFormData, setContentFormData] = useState({
    title: '',
    type: 'video' as 'video' | 'text' | 'pdf',
    content: '',
    youtubeUrl: '',
    order: 1
  });

  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 0,
    passingScore: 70,
    attempts: 3,
    questions: [] as QuizQuestion[]
  });

  const categories = ["Data Analytics", "Data Science", "Web Development", "Digital Marketing", "Software Development", "Mobile Development"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Mock quizzes data
  useEffect(() => {
    const mockQuizzes: Quiz[] = [
      {
        id: "q1",
        courseId: "1",
        title: "Data Analytics Basics Quiz",
        description: "Test your understanding of fundamental data analytics concepts",
        timeLimit: 30,
        passingScore: 80,
        attempts: 2,
        createdAt: new Date('2024-01-20'),
        questions: [
          {
            id: "q1-1",
            question: "What is the primary purpose of data analytics?",
            type: "multiple-choice",
            options: [
              "To collect data",
              "To analyze raw data and make conclusions",
              "To store data",
              "To delete unnecessary data"
            ],
            correctAnswer: 1,
            explanation: "Data analytics is the science of analyzing raw data to make conclusions about information.",
            points: 10
          }
        ]
      }
    ];
    setQuizzes(mockQuizzes);
  }, []);

  // Update parent component when courses change
  useEffect(() => {
    if (onCoursesUpdate) {
      onCoursesUpdate(courses);
    }
  }, [courses, onCoursesUpdate]);

  const extractYouTubeVideoId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
  };

  const addContentToCourse = () => {
    const newContent: CourseContent = {
      id: Date.now().toString(),
      title: contentFormData.title,
      type: contentFormData.type,
      content: contentFormData.type === 'video' ? 
        `https://www.youtube.com/embed/${extractYouTubeVideoId(contentFormData.youtubeUrl)}` : 
        contentFormData.content,
      order: contentFormData.order,
      videoId: contentFormData.type === 'video' ? extractYouTubeVideoId(contentFormData.youtubeUrl) : undefined
    };

    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newContent].sort((a, b) => a.order - b.order)
    }));

    // Reset content form
    setContentFormData({
      title: '',
      type: 'video',
      content: '',
      youtubeUrl: '',
      order: formData.content.length + 2
    });
  };

  const removeContentFromCourse = (contentId: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter(c => c.id !== contentId)
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentInputChange = (field: string, value: string | number) => {
    setContentFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuizInputChange = (field: string, value: string | number) => {
    setQuizFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData: Course = {
      id: editingCourse?.id || Date.now(),
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      instructor: formData.instructor,
      thumbnail: formData.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
      price: formData.price,
      prerequisites: formData.prerequisites.split(',').map(p => p.trim()).filter(p => p),
      learningObjectives: formData.learningObjectives.split('\n').filter(obj => obj.trim()),
      curriculum: formData.curriculum.split('\n').filter(item => item.trim()),
      status: formData.status,
      students: editingCourse?.students || 0,
      rating: editingCourse?.rating || 4.5,
      createdAt: editingCourse?.createdAt || new Date(),
      updatedAt: new Date(),
      content: formData.content
    };

    if (editingCourse) {
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? courseData : course
      ));
      toast({
        title: "Course Updated",
        description: "The course has been successfully updated with all content.",
      });
    } else {
      setCourses(prev => [...prev, courseData]);
      toast({
        title: "Course Created",
        description: "The new course has been successfully created with content.",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quizData: Quiz = {
      id: editingQuiz?.id || Date.now().toString(),
      courseId: quizFormData.courseId,
      title: quizFormData.title,
      description: quizFormData.description,
      timeLimit: quizFormData.timeLimit,
      passingScore: quizFormData.passingScore,
      attempts: quizFormData.attempts,
      questions: quizFormData.questions,
      createdAt: editingQuiz?.createdAt || new Date()
    };

    if (editingQuiz) {
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === editingQuiz.id ? quizData : quiz
      ));
      toast({
        title: "Quiz Updated",
        description: "The quiz has been successfully updated.",
      });
    } else {
      setQuizzes(prev => [...prev, quizData]);
      toast({
        title: "Quiz Created",
        description: "The new quiz has been successfully created.",
      });
    }

    resetQuizForm();
    setIsQuizDialogOpen(false);
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10
    };
    setQuizFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setQuizFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuizQuestion = (index: number) => {
    setQuizFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      fullDescription: course.fullDescription || '',
      category: course.category,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      price: course.price || 0,
      prerequisites: course.prerequisites?.join(', ') || '',
      learningObjectives: course.learningObjectives?.join('\n') || '',
      curriculum: course.curriculum?.join('\n') || '',
      status: course.status || 'draft',
      content: course.content || []
    });
    setIsDialogOpen(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizFormData({
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId,
      timeLimit: quiz.timeLimit || 0,
      passingScore: quiz.passingScore,
      attempts: quiz.attempts,
      questions: quiz.questions
    });
    setIsQuizDialogOpen(true);
  };

  const handleDelete = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Course Deleted",
      description: "The course has been successfully deleted.",
      variant: "destructive"
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    toast({
      title: "Quiz Deleted", 
      description: "The quiz has been successfully deleted.",
      variant: "destructive"
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      category: '',
      level: '',
      duration: '',
      instructor: '',
      thumbnail: '',
      price: 0,
      prerequisites: '',
      learningObjectives: '',
      curriculum: '',
      status: 'draft',
      content: []
    });
    setContentFormData({
      title: '',
      type: 'video',
      content: '',
      youtubeUrl: '',
      order: 1
    });
    setEditingCourse(null);
  };

  const resetQuizForm = () => {
    setQuizFormData({
      title: '',
      description: '',
      courseId: '',
      timeLimit: 0,
      passingScore: 70,
      attempts: 3,
      questions: []
    });
    setEditingQuiz(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id.toString() === courseId);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course & Content Management</h2>
          <p className="text-gray-600">Create, edit, and manage your courses, content, and quizzes</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'courses'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Courses
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'quizzes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileQuestion className="h-4 w-4 inline mr-2" />
          Quizzes
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <>
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the course details and add content below to {editingCourse ? 'update' : 'create'} the course.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Course Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Course Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter course title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Instructor</label>
                      <Input
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                        placeholder="Instructor name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Short Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief course description"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Full Description</label>
                    <Textarea
                      value={formData.fullDescription}
                      onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                      placeholder="Detailed course description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Level</label>
                      <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Duration</label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 8 weeks"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price ($)</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="Course price"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                    <Input
                      value={formData.thumbnail}
                      onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                      placeholder="Course thumbnail URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Prerequisites (comma-separated)</label>
                    <Input
                      value={formData.prerequisites}
                      onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                      placeholder="e.g., Basic Math, Computer Literacy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Learning Objectives (one per line)</label>
                    <Textarea
                      value={formData.learningObjectives}
                      onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                      placeholder="Enter learning objectives, one per line"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Curriculum (one module per line)</label>
                    <Textarea
                      value={formData.curriculum}
                      onChange={(e) => handleInputChange('curriculum', e.target.value)}
                      placeholder="Enter curriculum modules, one per line"
                      rows={6}
                    />
                  </div>

                  {/* Course Content Section */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                    </div>

                    {/* Add Content Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-3">Add New Content</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Content Title</label>
                          <Input
                            value={contentFormData.title}
                            onChange={(e) => handleContentInputChange('title', e.target.value)}
                            placeholder="e.g., Introduction to Data Analytics"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Content Type</label>
                          <Select value={contentFormData.type} onValueChange={(value) => handleContentInputChange('type', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4">
                        {contentFormData.type === 'video' ? (
                          <div>
                            <label className="block text-sm font-medium mb-1">YouTube URL</label>
                            <Input
                              value={contentFormData.youtubeUrl}
                              onChange={(e) => handleContentInputChange('youtubeUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <Textarea
                              value={contentFormData.content}
                              onChange={(e) => handleContentInputChange('content', e.target.value)}
                              placeholder="Enter your content here..."
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <label className="block text-sm font-medium mb-1">Order</label>
                          <Input
                            type="number"
                            value={contentFormData.order}
                            onChange={(e) => handleContentInputChange('order', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-20"
                          />
                        </div>
                        <Button type="button" onClick={addContentToCourse} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Content
                        </Button>
                      </div>
                    </div>

                    {/* Content List */}
                    {formData.content.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Course Content ({formData.content.length} items)</h4>
                        {formData.content.sort((a, b) => a.order - b.order).map((content, index) => (
                          <div key={content.id} className="flex items-center justify-between p-3 bg-white border rounded">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">#{content.order}</span>
                              <div className="flex items-center space-x-2">
                                {content.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                                {content.type === 'text' && <FileText className="h-4 w-4 text-blue-500" />}
                                {content.type === 'pdf' && <Upload className="h-4 w-4 text-green-500" />}
                                <span className="font-medium">{content.title}</span>
                              </div>
                              <Badge variant="outline">{content.type}</Badge>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeContentFromCourse(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>Manage your course catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.instructor}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>
                        <Badge variant={course.level === 'Beginner' ? 'secondary' : course.level === 'Intermediate' ? 'default' : 'destructive'}>
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(course.status || 'draft')}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.content?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students}
                        </div>
                      </TableCell>
                      <TableCell>${course.price || 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <>
          <div className="flex justify-end">
            <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetQuizForm()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                  </DialogTitle>
                  <DialogDescription>
                    Create a quiz to test your students' knowledge
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quiz Title</label>
                      <Input
                        value={quizFormData.title}
                        onChange={(e) => handleQuizInputChange('title', e.target.value)}
                        placeholder="Enter quiz title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Course</label>
                      <Select value={quizFormData.courseId} onValueChange={(value) => handleQuizInputChange('courseId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={quizFormData.description}
                      onChange={(e) => handleQuizInputChange('description', e.target.value)}
                      placeholder="Quiz description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                      <Input
                        type="number"
                        value={quizFormData.timeLimit}
                        onChange={(e) => handleQuizInputChange('timeLimit', parseInt(e.target.value) || 0)}
                        placeholder="0 for unlimited"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                      <Input
                        type="number"
                        value={quizFormData.passingScore}
                        onChange={(e) => handleQuizInputChange('passingScore', parseInt(e.target.value) || 70)}
                        placeholder="70"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Attempts</label>
                      <Input
                        type="number"
                        value={quizFormData.attempts}
                        onChange={(e) => handleQuizInputChange('attempts', parseInt(e.target.value) || 1)}
                        placeholder="3"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Quiz Questions */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Questions</h4>
                      <Button type="button" onClick={addQuizQuestion} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {quizFormData.questions.map((question, index) => (
                      <Card key={question.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium">Question {index + 1}</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuizQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Question</label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                              placeholder="Enter your question"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Question Type</label>
                              <Select 
                                value={question.type} 
                                onValueChange={(value) => updateQuizQuestion(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="true-false">True/False</SelectItem>
                                  <SelectItem value="short-answer">Short Answer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">Points</label>
                              <Input
                                type="number"
                                value={question.points}
                                onChange={(e) => updateQuizQuestion(index, 'points', parseInt(e.target.value) || 10)}
                                min="1"
                              />
                            </div>
                          </div>

                          {question.type === 'multiple-choice' && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">Answer Options</label>
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuizQuestion(index, 'correctAnswer', optionIndex)}
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = e.target.value;
                                      updateQuizQuestion(index, 'options', newOptions);
                                    }}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === 'true-false' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">Correct Answer</label>
                              <Select 
                                value={question.correctAnswer?.toString()} 
                                onValueChange={(value) => updateQuizQuestion(index, 'correctAnswer', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">True</SelectItem>
                                  <SelectItem value="1">False</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {question.type === 'short-answer' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">Sample Answer</label>
                              <Input
                                value={question.correctAnswer as string}
                                onChange={(e) => updateQuizQuestion(index, 'correctAnswer', e.target.value)}
                                placeholder="Expected answer or keywords"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                            <Textarea
                              value={question.explanation || ''}
                              onChange={(e) => updateQuizQuestion(index, 'explanation', e.target.value)}
                              placeholder="Explain the correct answer"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quizzes Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Quizzes</CardTitle>
              <CardDescription>Manage course quizzes and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCourseTitle(quiz.courseId)}</TableCell>
                      <TableCell>{quiz.questions.length}</TableCell>
                      <TableCell>
                        {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Unlimited'}
                      </TableCell>
                      <TableCell>{quiz.passingScore}%</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuiz(quiz)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Course Details Dialog */}
      <Dialog open={!!viewingCourse} onOpenChange={() => setViewingCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{viewingCourse.title}</span>
                  {getStatusBadge(viewingCourse.status || 'draft')}
                </DialogTitle>
                <DialogDescription>
                  Course details and curriculum information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Instructor:</strong> {viewingCourse.instructor}</div>
                      <div><strong>Category:</strong> {viewingCourse.category}</div>
                      <div><strong>Level:</strong> {viewingCourse.level}</div>
                      <div><strong>Duration:</strong> {viewingCourse.duration}</div>
                      <div><strong>Price:</strong> ${viewingCourse.price || 0}</div>
                      <div><strong>Students:</strong> {viewingCourse.students}</div>
                      <div><strong>Rating:</strong> {viewingCourse.rating}/5</div>
                    </div>
                  </div>
                  
                  <div>
                    <img 
                      src={viewingCourse.thumbnail} 
                      alt={viewingCourse.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{viewingCourse.fullDescription || viewingCourse.description}</p>
                </div>

                {viewingCourse.prerequisites && viewingCourse.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Prerequisites</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingCourse.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline">{prereq}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewingCourse.learningObjectives && viewingCourse.learningObjectives.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Learning Objectives</h4>
                    <ul className="text-sm space-y-1">
                      {viewingCourse.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewingCourse.curriculum && viewingCourse.curriculum.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Curriculum</h4>
                    <div className="space-y-2">
                      {viewingCourse.curriculum.map((module, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="text-sm">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingCourse.content && viewingCourse.content.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Course Content</h4>
                    <div className="space-y-3">
                      {viewingCourse.content.sort((a, b) => a.order - b.order).map((item) => (
                        <div key={item.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{item.title}</h5>
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          {item.type === 'text' && (
                            <p className="text-sm text-gray-600">{item.content}</p>
                          )}
                          {item.type === 'video' && (
                            <div className="aspect-video">
                              <iframe
                                src={item.content}
                                className="w-full h-full rounded"
                                allowFullScreen
                                title={item.title}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
