
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Users, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  image: string;
  price: number;
  prerequisites: string[];
  learningObjectives: string[];
  curriculum: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface CourseManagementProps {
  userRole: 'educator' | 'admin';
}

const CourseManagement = ({ userRole }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: '',
    level: '',
    duration: '',
    instructor: '',
    image: '',
    price: 0,
    prerequisites: '',
    learningObjectives: '',
    curriculum: '',
    status: 'draft' as const
  });

  const categories = ["Data Analytics", "Data Science", "Web Development", "Digital Marketing", "Software Development", "Mobile Development"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Mock data with more detailed courses
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: "1",
        title: "Data Analytics Fundamentals",
        description: "Learn the basics of data analysis, visualization, and interpretation using modern tools and techniques.",
        fullDescription: "This comprehensive course introduces students to the world of data analytics. You'll learn to collect, process, and analyze data using industry-standard tools like Excel, Python, and SQL. The course covers statistical analysis, data visualization, and practical applications in business intelligence.",
        category: "Data Analytics",
        level: "Beginner",
        duration: "6 weeks",
        students: 245,
        rating: 4.8,
        instructor: "Dr. Sarah Chen",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
        price: 299,
        prerequisites: ["Basic Mathematics", "Computer Literacy"],
        learningObjectives: [
          "Understand fundamental data analysis concepts",
          "Create compelling data visualizations",
          "Perform statistical analysis on datasets",
          "Build interactive dashboards"
        ],
        curriculum: [
          "Introduction to Data Analytics",
          "Excel for Data Analysis",
          "Introduction to Python/R",
          "Statistical Analysis Fundamentals",
          "Data Visualization Techniques",
          "Business Intelligence Basics",
          "Final Project: Real-world Analysis"
        ],
        status: 'published',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-06-20')
      },
      {
        id: "2",
        title: "Advanced Data Science with Machine Learning",
        description: "Master machine learning algorithms, statistical modeling, and big data processing techniques.",
        fullDescription: "Advanced course covering machine learning algorithms, deep learning, and AI applications. Students will work with large datasets, implement ML models, and deploy solutions in production environments.",
        category: "Data Science",
        level: "Advanced",
        duration: "12 weeks",
        students: 156,
        rating: 4.9,
        instructor: "Prof. Michael Torres",
        image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=200&fit=crop",
        price: 899,
        prerequisites: ["Python Programming", "Statistics", "Linear Algebra"],
        learningObjectives: [
          "Implement machine learning algorithms from scratch",
          "Work with neural networks and deep learning",
          "Handle big data processing",
          "Deploy ML models in production"
        ],
        curriculum: [
          "Machine Learning Fundamentals",
          "Supervised Learning Algorithms",
          "Unsupervised Learning Techniques",
          "Deep Learning and Neural Networks",
          "Natural Language Processing",
          "Computer Vision Applications",
          "MLOps and Model Deployment",
          "Capstone Project"
        ],
        status: 'published',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-06-25')
      },
      {
        id: "3",
        title: "Full-Stack Web Development Bootcamp",
        description: "Build modern web applications using React, Node.js, and database technologies.",
        fullDescription: "Comprehensive bootcamp covering frontend and backend development. Learn to build scalable web applications using modern frameworks and tools.",
        category: "Web Development",
        level: "Intermediate",
        duration: "16 weeks",
        students: 398,
        rating: 4.7,
        instructor: "Alex Rodriguez",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
        price: 1299,
        prerequisites: ["HTML/CSS Basics", "JavaScript Fundamentals"],
        learningObjectives: [
          "Build responsive web applications",
          "Develop RESTful APIs",
          "Implement user authentication",
          "Deploy applications to cloud platforms"
        ],
        curriculum: [
          "Advanced HTML/CSS and Responsive Design",
          "JavaScript ES6+ Features",
          "React.js Fundamentals",
          "State Management with Redux",
          "Node.js and Express.js",
          "Database Design and MongoDB",
          "Authentication and Security",
          "Testing and Deployment",
          "Full-Stack Project"
        ],
        status: 'published',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-06-30')
      }
    ];
    setCourses(mockCourses);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData: Course = {
      id: editingCourse?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      instructor: formData.instructor,
      image: formData.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
      price: formData.price,
      prerequisites: formData.prerequisites.split(',').map(p => p.trim()),
      learningObjectives: formData.learningObjectives.split('\n').filter(obj => obj.trim()),
      curriculum: formData.curriculum.split('\n').filter(item => item.trim()),
      status: formData.status,
      students: editingCourse?.students || 0,
      rating: editingCourse?.rating || 0,
      createdAt: editingCourse?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingCourse) {
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? courseData : course
      ));
      toast({
        title: "Course Updated",
        description: "The course has been successfully updated.",
      });
    } else {
      setCourses(prev => [...prev, courseData]);
      toast({
        title: "Course Created",
        description: "The new course has been successfully created.",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      fullDescription: course.fullDescription,
      category: course.category,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor,
      image: course.image,
      price: course.price,
      prerequisites: course.prerequisites.join(', '),
      learningObjectives: course.learningObjectives.join('\n'),
      curriculum: course.curriculum.join('\n'),
      status: course.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Course Deleted",
      description: "The course has been successfully deleted.",
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
      image: '',
      price: 0,
      prerequisites: '',
      learningObjectives: '',
      curriculum: '',
      status: 'draft'
    });
    setEditingCourse(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">Create, edit, and manage your courses</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </DialogTitle>
              <DialogDescription>
                Fill in the course details below to {editingCourse ? 'update' : 'create'} the course.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Course image URL"
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
                        src={course.image} 
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
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students}
                    </div>
                  </TableCell>
                  <TableCell>${course.price}</TableCell>
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

      {/* Course Details Dialog */}
      <Dialog open={!!viewingCourse} onOpenChange={() => setViewingCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{viewingCourse.title}</span>
                  {getStatusBadge(viewingCourse.status)}
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
                      <div><strong>Price:</strong> ${viewingCourse.price}</div>
                      <div><strong>Students:</strong> {viewingCourse.students}</div>
                      <div><strong>Rating:</strong> {viewingCourse.rating}/5</div>
                    </div>
                  </div>
                  
                  <div>
                    <img 
                      src={viewingCourse.image} 
                      alt={viewingCourse.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{viewingCourse.fullDescription}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingCourse.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline">{prereq}</Badge>
                    ))}
                  </div>
                </div>

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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
