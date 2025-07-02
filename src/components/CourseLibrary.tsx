
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Users, Star, Search, Filter } from "lucide-react";

interface CourseLibraryProps {
  userRole: 'learner' | 'educator' | 'admin';
}

const CourseLibrary = ({ userRole }: CourseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Data Analytics Fundamentals",
      description: "Learn the basics of data analysis, visualization, and interpretation using modern tools and techniques.",
      category: "Data Analytics",
      level: "Beginner",
      duration: "6 weeks",
      students: 245,
      rating: 4.8,
      instructor: "Dr. Sarah Chen",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
    },
    {
      id: 2,
      title: "Advanced Data Science",
      description: "Master machine learning algorithms, statistical modeling, and big data processing.",
      category: "Data Science",
      level: "Advanced",
      duration: "12 weeks",
      students: 156,
      rating: 4.9,
      instructor: "Prof. Michael Torres",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=200&fit=crop",
    },
    {
      id: 3,
      title: "Full-Stack Web Development",
      description: "Build modern web applications using React, Node.js, and database technologies.",
      category: "Web Development",
      level: "Intermediate",
      duration: "16 weeks",
      students: 398,
      rating: 4.7,
      instructor: "Alex Rodriguez",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
    },
    {
      id: 4,
      title: "Digital Marketing Mastery",
      description: "Learn SEO, social media marketing, content strategy, and analytics for digital success.",
      category: "Digital Marketing",
      level: "Beginner",
      duration: "8 weeks",
      students: 567,
      rating: 4.6,
      instructor: "Emma Thompson",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=300&h=200&fit=crop",
    },
    {
      id: 5,
      title: "Software Development Principles",
      description: "Master software engineering best practices, design patterns, and development methodologies.",
      category: "Software Development",
      level: "Intermediate",
      duration: "10 weeks",
      students: 289,
      rating: 4.8,
      instructor: "David Kim",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop",
    },
    {
      id: 6,
      title: "Mobile App Development",
      description: "Create native and cross-platform mobile applications for iOS and Android.",
      category: "Software Development",
      level: "Advanced",
      duration: "14 weeks",
      students: 134,
      rating: 4.9,
      instructor: "Lisa Park",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    },
  ];

  const categories = ["all", "Data Analytics", "Data Science", "Web Development", "Digital Marketing", "Software Development"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'secondary';
      case 'Intermediate':
        return 'default';
      case 'Advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level === "all" ? "All Levels" : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div className="aspect-video bg-gray-200 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
            
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={getLevelBadgeVariant(course.level)}>
                  {course.level}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students}</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Instructor: </span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <BookOpen className="h-4 w-4 mr-2" />
                {userRole === 'learner' ? 'Enroll Now' : userRole === 'educator' ? 'View Course' : 'Manage Course'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CourseLibrary;
