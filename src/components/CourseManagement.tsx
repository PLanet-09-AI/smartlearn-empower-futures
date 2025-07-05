import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Video, FileText, Upload } from "lucide-react";
import { courses as initialCourses } from "@/data/courses";

interface CourseContent {
  id: number;
  title: string;
  type: 'video' | 'text' | 'pdf';
  content: string;
  duration?: string;
  order: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  thumbnail: string;
  content: CourseContent[];
  status: 'draft' | 'published' | 'archived';
}

interface Quiz {
  id: number;
  courseId: number;
  title: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface CourseManagementProps {
  userRole: 'educator' | 'admin';
  onCoursesUpdate: (courses: Course[]) => void;
}

const CourseManagement = ({ userRole, onCoursesUpdate }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses.map(course => ({
    ...course,
    content: course.content?.map((item, index) => ({
      ...item,
      order: index + 1
    })) || [],
    status: 'published' as const
  })));
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<number | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    instructor: '',
    thumbnail: '',
    status: 'draft' as const
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'video' as const,
    content: '',
    duration: '',
    youtubeUrl: ''
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    courseId: 0,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  useEffect(() => {
    onCoursesUpdate(courses);
  }, [courses, onCoursesUpdate]);

  const handleCreateCourse = () => {
    const newCourse: Course = {
      id: Date.now(),
      ...courseForm,
      students: 0,
      rating: 0,
      content: []
    };
    
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: '',
      duration: '',
      instructor: '',
      thumbnail: '',
      status: 'draft'
    });
    setIsCreateCourseOpen(false);
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    
    const updatedCourses = courses.map(course => 
      course.id === editingCourse.id ? { ...editingCourse, ...courseForm } : course
    );
    setCourses(updatedCourses);
    setEditingCourse(null);
    setIsCreateCourseOpen(false);
  };

  const handleDeleteCourse = (courseId: number) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    setCourses(updatedCourses);
  };

  const handleAddContent = () => {
    if (!selectedCourseForContent) return;
    
    const newContent: CourseContent = {
      id: Date.now(),
      title: contentForm.title,
      type: contentForm.type,
      content: contentForm.type === 'video' && contentForm.youtubeUrl 
        ? contentForm.youtubeUrl 
        : contentForm.content,
      duration: contentForm.duration,
      order: 1
    };

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseForContent) {
        const maxOrder = Math.max(0, ...course.content.map(c => c.order));
        return {
          ...course,
          content: [...course.content, { ...newContent, order: maxOrder + 1 }]
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    setContentForm({
      title: '',
      type: 'video',
      content: '',
      duration: '',
      youtubeUrl: ''
    });
    setIsAddContentOpen(false);
    setSelectedCourseForContent(null);
  };

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now(),
      ...quizForm
    };
    
    setQuizzes([...quizzes, newQuiz]);
    setQuizForm({
      title: '',
      courseId: 0,
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
    setIsCreateQuizOpen(false);
  };

  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = quizForm.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = quizForm.questions.map((q, i) => {
      if (i === questionIndex) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      status: course.status
    });
    setIsCreateCourseOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">Create and manage your courses and content</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Update course information' : 'Fill out the details for your new course'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    placeholder="Enter course title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={courseForm.category} onValueChange={(value) => setCourseForm({...courseForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                    placeholder="Instructor name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={courseForm.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setCourseForm({...courseForm, status: value})}>
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
                <Button variant="outline" onClick={() => {
                  setIsCreateCourseOpen(false);
                  setEditingCourse(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={editingCourse ? handleUpdateCourse : handleCreateCourse} className="bg-purple-600 hover:bg-purple-700">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <Badge 
                    variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'destructive'}
                    className="absolute top-2 right-2"
                  >
                    {course.status}
                  </Badge>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{course.category}</Badge>
                    <span className="text-gray-500">{course.level}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>👥 {course.students} students</span>
                    <span>⭐ {course.rating}/5</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>📚 {course.content.length} lessons</span>
                    <span>⏱️ {course.duration}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(course)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedCourseForContent(course.id);
                        setIsAddContentOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Content
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Course Content</DialogTitle>
                <DialogDescription>Add video, text, or PDF content to your course</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-select">Select Course</Label>
                  <Select value={selectedCourseForContent?.toString() || ""} onValueChange={(value) => setSelectedCourseForContent(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-title">Content Title</Label>
                  <Input
                    id="content-title"
                    value={contentForm.title}
                    onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                    placeholder="Enter content title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentForm.type} onValueChange={(value: 'video' | 'text' | 'pdf') => setContentForm({...contentForm, type: value})}>
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
                
                {contentForm.type === 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <Input
                      id="youtube-url"
                      value={contentForm.youtubeUrl}
                      onChange={(e) => setContentForm({...contentForm, youtubeUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                )}
                
                {contentForm.type !== 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="content-body">Content</Label>
                    <Textarea
                      id="content-body"
                      value={contentForm.content}
                      onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                      placeholder="Enter content or URL"
                      rows={4}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    value={contentForm.duration}
                    onChange={(e) => setContentForm({...contentForm, duration: e.target.value})}
                    placeholder="e.g., 15 min"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
                <Button onClick={handleAddContent} className="bg-purple-600 hover:bg-purple-700">Add Content</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.content.length} content items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.content.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 text-sm">
                        {item.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                        {item.type === 'text' && <FileText className="h-4 w-4 text-blue-500" />}
                        {item.type === 'pdf' && <Upload className="h-4 w-4 text-green-500" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {course.content.length > 3 && (
                      <p className="text-xs text-gray-500">+{course.content.length - 3} more items</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Quiz</DialogTitle>
                <DialogDescription>Create a quiz for your course</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quiz Title</Label>
                    <Input
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      placeholder="Enter quiz title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={quizForm.courseId.toString()} onValueChange={(value) => setQuizForm({...quizForm, courseId: Number(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  
                  {quizForm.questions.map((question, qIndex) => (
                    <Card key={qIndex}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="space-y-2">
                          <Label>Question {qIndex + 1}</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Enter question"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
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
                <Button variant="outline" onClick={() => setIsCreateQuizOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateQuiz} className="bg-purple-600 hover:bg-purple-700">Create Quiz</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => {
              const course = courses.find(c => c.id === quiz.courseId);
              return (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{course?.title || 'Unknown Course'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>📝 {quiz.questions.length} questions</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseManagement;
