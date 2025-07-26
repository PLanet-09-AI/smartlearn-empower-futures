
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Eye, Upload, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Course, CourseContent, Quiz, QuizQuestion } from "@/types";

interface CourseManagementProps {
  userRole: 'educator' | 'admin';
  courses: Course[];
  onCoursesUpdate: (courses: Course[]) => void;
}

const CourseManagement = ({ userRole, courses, onCoursesUpdate }: CourseManagementProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    duration: "",
    instructor: "",
    thumbnail: "",
    content: [],
    quiz: { id: Date.now(), title: "", questions: [] },
    status: "draft"
  });

  // Content management states
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null);
  const [newContent, setNewContent] = useState<Partial<CourseContent>>({
    title: "",
    type: "text",
    duration: "",
    content: ""
  });

  // Quiz management states
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingCourse) {
          setEditingCourse({ ...editingCourse, thumbnail: base64String });
        } else {
          setNewCourse({ ...newCourse, thumbnail: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const course: Course = {
      id: Date.now(),
      title: newCourse.title!,
      description: newCourse.description!,
      category: newCourse.category || "General",
      level: newCourse.level as 'Beginner' | 'Intermediate' | 'Advanced',
      duration: newCourse.duration || "1 hour",
      rating: 0,
      students: 0,
      instructor: newCourse.instructor || "Instructor",
      thumbnail: newCourse.thumbnail || "/placeholder.svg",
      content: [],
      quiz: { id: Date.now(), title: newCourse.title + " Quiz", questions: [] },
      status: "draft"
    };

    const updatedCourses = [...courses, course];
    onCoursesUpdate(updatedCourses);
    setIsCreating(false);
    setNewCourse({
      title: "",
      description: "",
      category: "",
      level: "Beginner",
      duration: "",
      instructor: "",
      thumbnail: "",
      content: [],
      quiz: { id: Date.now(), title: "", questions: [] },
      status: "draft"
    });

    toast({
      title: "Success",
      description: "Course created successfully!",
    });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse({ ...course });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === editingCourse.id ? editingCourse : course
    );
    onCoursesUpdate(updatedCourses);
    setEditingCourse(null);

    toast({
      title: "Success",
      description: "Course updated successfully!",
    });
  };

  const handleDeleteCourse = (courseId: number) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    onCoursesUpdate(updatedCourses);
    
    toast({
      title: "Success",
      description: "Course deleted successfully!",
    });
  };

  const handlePublishCourse = (courseId: number) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId ? { ...course, status: 'published' as const } : course
    );
    onCoursesUpdate(updatedCourses);

    toast({
      title: "Success",
      description: "Course published successfully!",
    });
  };

  // Content management functions
  const handleAddContent = () => {
    if (!editingCourse || !newContent.title || !newContent.content) {
      toast({
        title: "Error",
        description: "Please fill in all content fields",
        variant: "destructive",
      });
      return;
    }

    const content: CourseContent = {
      id: Date.now(),
      title: newContent.title!,
      type: newContent.type as 'text' | 'video' | 'pdf',
      duration: newContent.duration || "5 min",
      content: newContent.content!,
      videoUrl: newContent.videoUrl,
      url: newContent.url
    };

    const updatedCourse = {
      ...editingCourse,
      content: [...(editingCourse.content || []), content]
    };

    setEditingCourse(updatedCourse);
    setIsAddingContent(false);
    setNewContent({
      title: "",
      type: "text",
      duration: "",
      content: ""
    });

    toast({
      title: "Success",
      description: "Content added successfully!",
    });
  };

  const handleEditContent = (content: CourseContent) => {
    setEditingContent(content);
    setNewContent(content);
    setIsAddingContent(true);
  };

  const handleUpdateContent = () => {
    if (!editingCourse || !editingContent) return;

    const updatedContent = editingCourse.content.map(content =>
      content.id === editingContent.id ? { ...newContent, id: editingContent.id } as CourseContent : content
    );

    const updatedCourse = {
      ...editingCourse,
      content: updatedContent
    };

    setEditingCourse(updatedCourse);
    setEditingContent(null);
    setIsAddingContent(false);
    setNewContent({
      title: "",
      type: "text",
      duration: "",
      content: ""
    });

    toast({
      title: "Success",
      description: "Content updated successfully!",
    });
  };

  const handleDeleteContent = (contentId: number) => {
    if (!editingCourse) return;

    const updatedContent = editingCourse.content.filter(content => content.id !== contentId);
    const updatedCourse = {
      ...editingCourse,
      content: updatedContent
    };

    setEditingCourse(updatedCourse);

    toast({
      title: "Success",
      description: "Content deleted successfully!",
    });
  };

  // Quiz management functions
  const handleAddQuestion = () => {
    if (!editingCourse || !newQuestion.question || newQuestion.options?.some(opt => !opt)) {
      toast({
        title: "Error",
        description: "Please fill in the question and all options",
        variant: "destructive",
      });
      return;
    }

    const question: QuizQuestion = {
      id: Date.now(),
      question: newQuestion.question!,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer || 0
    };

    const updatedQuiz = {
      ...editingCourse.quiz,
      questions: [...(editingCourse.quiz.questions || []), question]
    };

    const updatedCourse = {
      ...editingCourse,
      quiz: updatedQuiz
    };

    setEditingCourse(updatedCourse);
    setIsAddingQuestion(false);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    });

    toast({
      title: "Success",
      description: "Question added successfully!",
    });
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setNewQuestion(question);
    setIsAddingQuestion(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingCourse || !editingQuestion) return;

    const updatedQuestions = editingCourse.quiz.questions.map(question =>
      question.id === editingQuestion.id ? { ...newQuestion, id: editingQuestion.id } as QuizQuestion : question
    );

    const updatedQuiz = {
      ...editingCourse.quiz,
      questions: updatedQuestions
    };

    const updatedCourse = {
      ...editingCourse,
      quiz: updatedQuiz
    };

    setEditingCourse(updatedCourse);
    setEditingQuestion(null);
    setIsAddingQuestion(false);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    });

    toast({
      title: "Success",
      description: "Question updated successfully!",
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!editingCourse) return;

    const updatedQuestions = editingCourse.quiz.questions.filter(question => question.id !== questionId);
    const updatedQuiz = {
      ...editingCourse.quiz,
      questions: updatedQuestions
    };

    const updatedCourse = {
      ...editingCourse,
      quiz: updatedQuiz
    };

    setEditingCourse(updatedCourse);

    toast({
      title: "Success",
      description: "Question deleted successfully!",
    });
  };

  if (editingCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Course: {editingCourse.title}</h2>
            <p className="text-gray-600">Manage course content and settings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdateCourse} data-voice="save-course">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditingCourse(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Management</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Update basic course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Course Title *</Label>
                    <Input
                      id="edit-title"
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editingCourse.category}
                      onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                      placeholder="e.g., Technology, Business"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    placeholder="Describe what students will learn"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-level">Level</Label>
                    <Select value={editingCourse.level} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setEditingCourse({ ...editingCourse, level: value })}>
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
                  <div>
                    <Label htmlFor="edit-duration">Duration</Label>
                    <Input
                      id="edit-duration"
                      value={editingCourse.duration}
                      onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                      placeholder="e.g., 2 hours, 5 days"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-instructor">Instructor</Label>
                    <Input
                      id="edit-instructor"
                      value={editingCourse.instructor}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      placeholder="Instructor name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-thumbnail">Course Thumbnail</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      id="edit-thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="flex-1"
                    />
                    {editingCourse.thumbnail && (
                      <div className="w-20 h-20 border rounded-lg overflow-hidden">
                        <img 
                          src={editingCourse.thumbnail} 
                          alt="Course thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <Button onClick={() => setIsAddingContent(true)} data-voice="add-content">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>

              {isAddingContent && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Content Title *</Label>
                        <Input
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          placeholder="Enter content title"
                        />
                      </div>
                      <div>
                        <Label>Content Type</Label>
                        <Select value={newContent.type} onValueChange={(value: 'text' | 'video' | 'pdf') => setNewContent({ ...newContent, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={newContent.duration}
                        onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                        placeholder="e.g., 10 minutes"
                      />
                    </div>

                    {newContent.type === 'text' && (
                      <div>
                        <Label>Content *</Label>
                        <Textarea
                          value={newContent.content}
                          onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                          placeholder="Enter text content"
                          rows={6}
                        />
                      </div>
                    )}

                    {newContent.type === 'video' && (
                      <div>
                        <Label>Video URL</Label>
                        <Input
                          value={newContent.videoUrl || ''}
                          onChange={(e) => setNewContent({ ...newContent, videoUrl: e.target.value, content: e.target.value })}
                          placeholder="Enter video URL"
                        />
                      </div>
                    )}

                    {newContent.type === 'pdf' && (
                      <div>
                        <Label>PDF URL</Label>
                        <Input
                          value={newContent.url || ''}
                          onChange={(e) => setNewContent({ ...newContent, url: e.target.value, content: e.target.value })}
                          placeholder="Enter PDF URL"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={editingContent ? handleUpdateContent : handleAddContent}>
                        {editingContent ? 'Update Content' : 'Add Content'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsAddingContent(false);
                        setEditingContent(null);
                        setNewContent({ title: "", type: "text", duration: "", content: "" });
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {editingCourse.content.map((content, index) => (
                  <Card key={content.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{content.type}</Badge>
                            <h4 className="font-medium">{content.title}</h4>
                            <span className="text-sm text-gray-500">({content.duration})</span>
                          </div>
                          {content.type === 'text' && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{content.content}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditContent(content)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteContent(content.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {editingCourse.content.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No content added yet. Click "Add Content" to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quiz Questions</h3>
                <Button onClick={() => setIsAddingQuestion(true)} data-voice="add-question">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {isAddingQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</CardTitle>
                    <CardDescription>
                      Create engaging questions to test student knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question *</Label>
                      <Textarea
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options *</Label>
                      {newQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 text-sm font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...(newQuestion.options || [])];
                              updatedOptions[index] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: updatedOptions });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === index}
                              onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                            />
                            <Label className="text-xs">Correct</Label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
                        {editingQuestion ? 'Update Question' : 'Add Question'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsAddingQuestion(false);
                        setEditingQuestion(null);
                        setNewQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {editingCourse.quiz.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">Q{index + 1}: {question.question}</h4>
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2 text-sm">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  question.correctAnswer === optIndex 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className={question.correctAnswer === optIndex ? 'font-medium text-green-800' : ''}>
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {editingCourse.quiz.questions.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No questions added yet. Click "Add Question" to create your first quiz question.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Manage all courses on the platform' : 'Create and manage your courses'}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} data-voice="create-course">
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Create Course Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>Fill in the details to create a new course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  placeholder="e.g., Technology, Business"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Describe what students will learn"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={newCourse.level} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setNewCourse({ ...newCourse, level: value })}>
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
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="e.g., 2 hours, 5 days"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="Instructor name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail">Course Thumbnail</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  className="flex-1"
                />
                {newCourse.thumbnail && (
                  <div className="w-20 h-20 border rounded-lg overflow-hidden">
                    <img 
                      src={newCourse.thumbnail} 
                      alt="Course thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateCourse}>Create Course</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="relative">
            <div className="absolute top-2 right-2 z-10">
              <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                {course.status}
              </Badge>
            </div>
            
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.level}</span>
                <span>{course.duration}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{course.students} students</span>
                <span>★ {course.rating}/5</span>
              </div>

              <Separator className="mb-4" />
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                {course.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublishCourse(course.id)} data-voice="publish-course">
                    <Eye className="h-3 w-3 mr-1" />
                    Publish
                  </Button>
                )}
                
                <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {courses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No courses created yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first course!</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
