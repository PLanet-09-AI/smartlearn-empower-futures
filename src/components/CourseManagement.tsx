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
import { Plus, Edit, Trash2, Eye, BookOpen, Users, Star, Clock, Video, FileText, File, X } from "lucide-react";
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
      setNewContent({
        title: '',
        type: 'video',
        url: '',
        content: '',
        duration: ''
      });
    }
  };

  const handleCreateQuiz = () => {
    if (newQuiz.title && newQuiz.courseId && newQuiz.questions && newQuiz.questions.length > 0) {
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
      setNewQuiz({
        title: '',
        courseId: 0,
        questions: []
      });
      setIsCreateQuizOpen(false);
    }
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(), // Generate a temporary ID
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
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                    placeholder="Enter image URL"
                  />
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
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Create a quiz for one of your courses.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quiz-title">Quiz Title</Label>
                  <Input
                    id="quiz-title"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course-select">Select Course</Label>
                  <Select value={newQuiz.courseId?.toString()} onValueChange={(value) => setNewQuiz({ ...newQuiz, courseId: parseInt(value) })}>
                    <SelectTrigger>
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
                    <Label>Questions</Label>
                    <Button onClick={addQuizQuestion} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {(newQuiz.questions || []).map((question, qIndex) => (
                    <Card key={qIndex}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
                          <Button
                            onClick={() => removeQuizQuestion(qIndex)}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Enter your question"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[oIndex] = e.target.value;
                                  updateQuizQuestion(qIndex, 'options', newOptions);
                                }}
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="text-purple-600"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateQuiz} className="bg-purple-600 hover:bg-purple-700">
                  Create Quiz
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
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

        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>
                    Course: {courses.find(c => c.id === quiz.courseId)?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {quiz.questions.length} questions
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Course Content</CardTitle>
              <CardDescription>Add videos, texts, or PDFs to your courses</CardDescription>
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

              {selectedCourseForContent && (
                <div className="space-y-4 border-t pt-4">
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

                  <Button onClick={handleAddContent} className="bg-purple-600 hover:bg-purple-700">
                    Add Content
                  </Button>
                </div>
              )}

              {selectedCourseForContent && selectedCourseForContent.content && selectedCourseForContent.content.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Current Content</h4>
                  <div className="space-y-2">
                    {selectedCourseForContent.content.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {item.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                          {item.type === 'text' && <FileText className="h-4 w-4 text-blue-500" />}
                          {item.type === 'pdf' && <File className="h-4 w-4 text-green-500" />}
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.duration}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
                <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                <Input
                  id="edit-thumbnail"
                  value={editingCourse.thumbnail}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                />
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
    </div>
  );
};

export default CourseManagement;
