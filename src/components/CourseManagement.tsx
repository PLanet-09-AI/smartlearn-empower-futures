
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, BookOpen, Users, Star, Clock, Video, FileText, File, X, Upload, Image } from "lucide-react";
import { courses as initialCourses } from "@/data/courses";
import { Course, CourseContent, Quiz, QuizQuestion } from "@/types";

interface CourseManagementProps {
  userRole: 'learner' | 'educator' | 'admin';
  onCoursesUpdate: (courses: Course[]) => void;
}

const CourseManagement = ({ userRole, onCoursesUpdate }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);
  const [newContent, setNewContent] = useState<Partial<CourseContent>>({
    title: '',
    type: 'video',
    url: '',
    content: '',
    duration: ''
  });

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    students: 0,
    rating: 0,
    instructor: '',
    thumbnail: '',
    status: 'draft',
    content: []
  });

  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    title: '',
    courseId: 0,
    questions: []
  });

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (isEditing && editingCourse) {
          setEditingCourse({ ...editingCourse, thumbnail: base64 });
        } else {
          setNewCourse({ ...newCourse, thumbnail: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = () => {
    if (newCourse.title && newCourse.description && newCourse.category) {
      const course: Course = {
        id: Date.now(),
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        level: newCourse.level as 'Beginner' | 'Intermediate' | 'Advanced',
        duration: newCourse.duration || '0 hours',
        students: 0,
        rating: 0,
        instructor: newCourse.instructor || 'Instructor',
        thumbnail: newCourse.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
        status: newCourse.status as 'draft' | 'published' | 'archived',
        content: [],
        quiz: {
          id: Date.now() + 1,
          title: `${newCourse.title} Quiz`,
          questions: []
        }
      };
      
      const updatedCourses = [...courses, course];
      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      setNewCourse({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        duration: '',
        students: 0,
        rating: 0,
        instructor: '',
        thumbnail: '',
        status: 'draft',
        content: []
      });
      setIsCreateCourseOpen(false);
    }
  };

  const handleUpdateCourse = () => {
    if (editingCourse) {
      const updatedCourses = courses.map(course =>
        course.id === editingCourse.id ? editingCourse : course
      );
      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    setCourses(updatedCourses);
    onCoursesUpdate(updatedCourses);
    setQuizzes(quizzes.filter(quiz => quiz.courseId !== courseId));
  };

  const handleAddContent = () => {
    if (selectedCourseForContent && newContent.title && newContent.type) {
      const content: CourseContent = {
        id: Date.now(),
        title: newContent.title,
        type: newContent.type as 'video' | 'text' | 'pdf',
        url: newContent.url,
        content: newContent.content || '',
        duration: newContent.duration || ''
      };

      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourseForContent.id) {
          return {
            ...course,
            content: [...(course.content || []), content]
          };
        }
        return course;
      });

      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      setSelectedCourseForContent(updatedCourses.find(c => c.id === selectedCourseForContent.id) || null);
      setNewContent({
        title: '',
        type: 'video',
        url: '',
        content: '',
        duration: ''
      });
    }
  };

  const handleEditContent = (content: CourseContent) => {
    setEditingContent(content);
  };

  const handleUpdateContent = () => {
    if (editingContent && selectedCourseForContent) {
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourseForContent.id) {
          return {
            ...course,
            content: course.content.map(item => 
              item.id === editingContent.id ? editingContent : item
            )
          };
        }
        return course;
      });

      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      setSelectedCourseForContent(updatedCourses.find(c => c.id === selectedCourseForContent.id) || null);
      setEditingContent(null);
    }
  };

  const handleDeleteContent = (contentId: number) => {
    if (selectedCourseForContent) {
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourseForContent.id) {
          return {
            ...course,
            content: course.content.filter(item => item.id !== contentId)
          };
        }
        return course;
      });

      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      setSelectedCourseForContent(updatedCourses.find(c => c.id === selectedCourseForContent.id) || null);
    }
  };

  const handleCreateQuiz = () => {
    if (newQuiz.title && newQuiz.courseId && newQuiz.questions && newQuiz.questions.length > 0) {
      // Validate that all questions have content and options
      const isValidQuiz = newQuiz.questions.every(q => 
        q.question.trim() !== '' && 
        q.options.every(option => option.trim() !== '') &&
        q.correctAnswer >= 0 && q.correctAnswer < q.options.length
      );

      if (!isValidQuiz) {
        alert('Please fill in all questions, options, and select correct answers');
        return;
      }

      const quiz: Quiz = {
        id: Date.now(),
        title: newQuiz.title,
        courseId: newQuiz.courseId,
        questions: newQuiz.questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      };
      
      setQuizzes([...quizzes, quiz]);
      
      // Also update the course's quiz
      const updatedCourses = courses.map(course => {
        if (course.id === newQuiz.courseId) {
          return { ...course, quiz };
        }
        return course;
      });
      setCourses(updatedCourses);
      onCoursesUpdate(updatedCourses);
      
      setNewQuiz({
        title: '',
        courseId: 0,
        questions: []
      });
      setIsCreateQuizOpen(false);
    } else {
      alert('Please fill in the quiz title, select a course, and add at least one question');
    }
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setNewQuiz({
      ...newQuiz,
      questions: [...(newQuiz.questions || []), newQuestion]
    });
  };

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...(newQuiz.questions || [])];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const removeQuizQuestion = (index: number) => {
    const updatedQuestions = (newQuiz.questions || []).filter((_, i) => i !== index);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleDeleteQuiz = (quizId: number) => {
    setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-gray-600">Create, edit, and manage your courses</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new course.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      placeholder="e.g., Programming, Design"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={newCourse.level} onValueChange={(value) => setNewCourse({ ...newCourse, level: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g., 4 hours, 2 weeks"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      placeholder="Instructor name"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Course Thumbnail</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {newCourse.thumbnail && (
                    <div className="mt-2">
                      <img 
                        src={newCourse.thumbnail} 
                        alt="Course thumbnail preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newCourse.status} onValueChange={(value) => setNewCourse({ ...newCourse, status: value as 'draft' | 'published' | 'archived' })}>
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
              <DialogFooter>
                <Button onClick={handleCreateCourse} className="bg-purple-600 hover:bg-purple-700">
                  Create Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Create a quiz for one of your courses. Add questions with multiple choice answers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quiz-title">Quiz Title *</Label>
                  <Input
                    id="quiz-title"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    placeholder="Enter quiz title"
                    className={!newQuiz.title ? "border-red-300" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course-select">Select Course *</Label>
                  <Select value={newQuiz.courseId?.toString()} onValueChange={(value) => setNewQuiz({ ...newQuiz, courseId: parseInt(value) })}>
                    <SelectTrigger className={!newQuiz.courseId ? "border-red-300" : ""}>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Questions *</Label>
                    <Button onClick={addQuizQuestion} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {(newQuiz.questions || []).length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No questions added yet</p>
                      <Button onClick={addQuizQuestion} variant="outline" className="mt-2">
                        Add Your First Question
                      </Button>
                    </div>
                  )}

                  {(newQuiz.questions || []).map((question, qIndex) => (
                    <Card key={qIndex} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Question {qIndex + 1}</CardTitle>
                          <Button
                            onClick={() => removeQuizQuestion(qIndex)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Question Text *</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Enter your question here..."
                            className={!question.question.trim() ? "border-red-300" : ""}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Answer Options * (Select the correct answer)</Label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <Label className="text-sm font-medium min-w-0 w-16">
                                Option {oIndex + 1}:
                              </Label>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[oIndex] = e.target.value;
                                  updateQuizQuestion(qIndex, 'options', newOptions);
                                }}
                                placeholder={`Enter option ${oIndex + 1}`}
                                className={`flex-1 ${!option.trim() ? "border-red-300" : ""} ${question.correctAnswer === oIndex ? "bg-green-50 border-green-300" : ""}`}
                              />
                              {question.correctAnswer === oIndex && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <div className="flex justify-between w-full">
                  <p className="text-sm text-gray-500 flex items-center">
                    {(newQuiz.questions || []).length} question(s) added
                  </p>
                  <Button 
                    onClick={handleCreateQuiz} 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!newQuiz.title || !newQuiz.courseId || (newQuiz.questions || []).length === 0}
                  >
                    Create Quiz
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'destructive'}
                      className={course.status === 'published' ? 'bg-green-500' : course.status === 'draft' ? 'bg-yellow-500' : 'bg-red-500'}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setEditingCourse(course)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Course Content</CardTitle>
              <CardDescription>Add, edit, and organize content for your courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Select Course</Label>
                <Select 
                  value={selectedCourseForContent?.id.toString()} 
                  onValueChange={(value) => {
                    const course = courses.find(c => c.id === parseInt(value));
                    setSelectedCourseForContent(course || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course to manage content" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourseForContent && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Content</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Content Title</Label>
                        <Input
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          placeholder="Enter content title"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Content Type</Label>
                        <Select 
                          value={newContent.type} 
                          onValueChange={(value) => setNewContent({ ...newContent, type: value as 'video' | 'text' | 'pdf' })}
                        >
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

                      {newContent.type === 'video' && (
                        <div className="grid gap-2">
                          <Label>YouTube URL</Label>
                          <Input
                            value={newContent.url}
                            onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                      )}

                      {newContent.type === 'text' && (
                        <div className="grid gap-2">
                          <Label>Text Content</Label>
                          <Textarea
                            value={newContent.content}
                            onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                            placeholder="Enter your text content here..."
                            rows={6}
                          />
                        </div>
                      )}

                      {newContent.type === 'pdf' && (
                        <div className="grid gap-2">
                          <Label>PDF URL</Label>
                          <Input
                            value={newContent.url}
                            onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                            placeholder="Enter PDF URL"
                          />
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label>Duration (optional)</Label>
                        <Input
                          value={newContent.duration}
                          onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                          placeholder="e.g., 10 minutes"
                        />
                      </div>

                      <Button 
                        onClick={handleAddContent} 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={!newContent.title || !newContent.type}
                      >
                        Add Content
                      </Button>
                    </div>
                  </div>

                  {selectedCourseForContent.content && selectedCourseForContent.content.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Existing Content</h3>
                      <div className="space-y-3">
                        {selectedCourseForContent.content.map((item) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {item.type === 'video' && <Video className="h-5 w-5 text-red-500" />}
                                {item.type === 'text' && <FileText className="h-5 w-5 text-blue-500" />}
                                {item.type === 'pdf' && <File className="h-5 w-5 text-green-500" />}
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-sm text-gray-500">{item.duration} • {item.type}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleEditContent(item)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{item.title}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteContent(item.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{quiz.title}</span>
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </CardTitle>
                  <CardDescription>
                    Course: {courses.find(c => c.id === quiz.courseId)?.title || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="font-medium">{quiz.questions.length}</span>
                      <span className="ml-1">questions</span>
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{quiz.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quizzes.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No quizzes created yet</p>
                  <Button 
                    onClick={() => setIsCreateQuizOpen(true)}
                    variant="outline"
                  >
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Course Dialog */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Select 
                    value={editingCourse.level} 
                    onValueChange={(value) => setEditingCourse({ ...editingCourse, level: value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-instructor">Instructor</Label>
                  <Input
                    id="edit-instructor"
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Course Thumbnail</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(e as any, true);
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {editingCourse.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={editingCourse.thumbnail} 
                      alt="Course thumbnail preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingCourse.status} 
                  onValueChange={(value) => setEditingCourse({ ...editingCourse, status: value as 'draft' | 'published' | 'archived' })}
                >
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
            <DialogFooter>
              <Button onClick={handleUpdateCourse} className="bg-purple-600 hover:bg-purple-700">
                Update Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Content Dialog */}
      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Update the content details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Content Title</Label>
                <Input
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                  placeholder="Enter content title"
                />
              </div>

              <div className="grid gap-2">
                <Label>Content Type</Label>
                <Select 
                  value={editingContent.type} 
                  onValueChange={(value) => setEditingContent({ ...editingContent, type: value as 'video' | 'text' | 'pdf' })}
                >
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

              {editingContent.type === 'video' && (
                <div className="grid gap-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={editingContent.url || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {editingContent.type === 'text' && (
                <div className="grid gap-2">
                  <Label>Text Content</Label>
                  <Textarea
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                    placeholder="Enter your text content here..."
                    rows={6}
                  />
                </div>
              )}

              {editingContent.type === 'pdf' && (
                <div className="grid gap-2">
                  <Label>PDF URL</Label>
                  <Input
                    value={editingContent.url || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, url: e.target.value })}
                    placeholder="Enter PDF URL"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Duration</Label>
                <Input
                  value={editingContent.duration}
                  onChange={(e) => setEditingContent({ ...editingContent, duration: e.target.value })}
                  placeholder="e.g., 10 minutes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateContent} className="bg-purple-600 hover:bg-purple-700">
                Update Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CourseManagement;
