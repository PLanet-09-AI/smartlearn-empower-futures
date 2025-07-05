
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Video, FileText, BookOpen } from "lucide-react";

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
  content?: any[];
}

interface CourseLibraryProps {
  userRole: 'learner' | 'educator' | 'admin';
  onCourseSelect: (courseId: number) => void;
  courses: Course[];
}

const CourseLibrary = ({ userRole, onCourseSelect, courses }: CourseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and levels from courses
  const categories = Array.from(new Set(courses.map(course => course.category)));
  const levels = Array.from(new Set(courses.map(course => course.level)));

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Library</h1>
        <div className="text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filters */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter courses based on your interests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  type="search"
                  id="search"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course List */}
        <div className="md:col-span-3">
          <ScrollArea className="h-[650px] w-full rounded-md border">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => onCourseSelect(course.id)}>
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" alt={course.instructor} />
                        <AvatarFallback className="text-xs">{course.instructor.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{course.instructor}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>👥</span>
                          <span>{course.students}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⏱️</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.category}</Badge>
                      {course.content && course.content.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.content.length} lessons</span>
                        </div>
                      )}
                    </div>

                    {/* Content Preview */}
                    {course.content && course.content.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500 mb-1">Preview content:</div>
                        <div className="flex flex-wrap gap-1">
                          {course.content.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.type === 'video' && <Video className="h-3 w-3 text-red-500" />}
                              {item.type === 'text' && <FileText className="h-3 w-3 text-blue-500" />}
                              <span className="truncate max-w-[80px]">{item.title}</span>
                            </div>
                          ))}
                          {course.content.length > 3 && (
                            <span className="text-xs text-gray-400">+{course.content.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {filteredCourses.length === 0 && (
                <div className="col-span-2 text-center py-10">
                  <div className="text-gray-400 mb-2">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">No courses found</p>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CourseLibrary;
