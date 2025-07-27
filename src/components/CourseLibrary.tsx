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
import ReactMarkdown from "react-markdown";
import removeMarkdown from "remove-markdown";
function cleanPlainText(text: string): string {
  // Remove markdown, then extra dashes, hashes, and blank lines
  let cleaned = removeMarkdown(text);
  cleaned = cleaned.replace(/^[\s\-#*_]+/gm, ""); // Remove leading -, #, *, _ and spaces
  cleaned = cleaned.replace(/\n{2,}/g, "\n"); // Collapse multiple newlines
  cleaned = cleaned.replace(/^\s+|\s+$/g, ""); // Trim
  return cleaned;
}
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
// import removeMarkdown from "remove-markdown"; // Add this import at the top (install with `npm install remove-markdown`);

interface Course {
  id: string;
  firebaseId?: string;
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
  onCourseSelect: (courseId: string) => void;
  courses: Course[];
}

const CourseLibrary = ({ userRole, onCourseSelect, courses }: CourseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  
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

  // Enhanced placeholder images from Unsplash
  const getCourseThumbnail = (course: Course) => {
    if (course.thumbnail && course.thumbnail !== '') {
      return course.thumbnail;
    }
    
    // Category-based placeholder images
    const placeholderImages = {
      'Programming': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      'Data Science': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop',
      'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      'Design': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
      'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      'default': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop'
    };
    
    return placeholderImages[course.category as keyof typeof placeholderImages] || placeholderImages.default;
  };

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
          {/* Course Detail Preview Modal/Section */}
          {selectedCourse && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0 relative flex flex-col md:flex-row">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-purple-600 text-xl"
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedLessonIdx(0);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
                {/* Sidebar: List of lessons */}
                <div className="w-full md:w-1/3 border-r p-6 bg-gray-50 min-w-[260px]">
                  <h2 className="text-2xl font-bold mb-2 break-words">{selectedCourse.title}</h2>
                  <div className="mb-4 text-gray-600 break-words">{selectedCourse.description}</div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge>{selectedCourse.category}</Badge>
                    <Badge variant="secondary">{selectedCourse.level}</Badge>
                    <Badge variant="outline">{selectedCourse.duration}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Lessons</h4>
                    <ul className="space-y-1">
                      {selectedCourse.content?.filter((c: any) => c.type === "text" && c.content).map((item: any, idx: number) => (
                        <li key={item.id || idx}>
                          <button
                            className={`w-full text-left px-2 py-1 rounded ${selectedLessonIdx === idx ? "bg-purple-100 font-bold" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedLessonIdx(idx)}
                          >
                            <span className="break-words">{item.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Main: Markdown Preview */}
                <div className="flex-1 overflow-auto p-0 flex flex-col items-center bg-white">
                  {selectedCourse.content &&
                    selectedCourse.content
                      .filter((c: any) => c.type === "text" && c.content)
                      .map((item: any, idx: number) =>
                        idx === selectedLessonIdx ? (
                          <div key={item.id || idx} className="w-full flex justify-center">
                            <div
                              className="prose prose-lg max-w-3xl w-full border rounded-lg p-8 bg-white shadow"
                              style={{
                                wordBreak: "break-word",
                                whiteSpace: "normal", // <-- fix: do NOT use pre-line, let markdown handle paragraphs
                                fontSize: "1.1rem",
                                lineHeight: "1.8",
                                background: "#fff"
                              }}
                            >
                              <div style={{whiteSpace: 'pre-line'}}>
                                {cleanPlainText(typeof item.content === 'string' ? item.content : String(item.content))}
                              </div>
                            </div>
                          </div>
                        ) : null
                      )}
                </div>
              </div>
            </div>
          )}
          <ScrollArea className="h-[650px] w-full rounded-md border">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-purple-300" 
                  onClick={() => {
                    setSelectedCourse(course);
                    onCourseSelect(course.id);
                  }}
                  title={course.firebaseId ? `Course ID: ${course.id}, Firebase ID: ${course.firebaseId}` : `Course ID: ${course.id}`}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={getCourseThumbnail(course)} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">{course.level}</Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg hover:text-purple-600 transition-colors">{course.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" alt={course.instructor} />
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                          {course.instructor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{course.instructor}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <span>⭐</span>
                          <span className="text-gray-700">{course.rating || 'New'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-500">
                          <span>👥</span>
                          <span className="text-gray-700">{course.students}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-500">
                          <span>⏱️</span>
                          <span className="text-gray-700">{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="hover:bg-purple-50 hover:border-purple-300">
                        {course.category}
                      </Badge>
                      {course.content && course.content.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.content.length} lessons</span>
                        </div>
                      )}
                    </div>

                    {/* Content Preview: removed, do not show any course content in the card */}
                    
                    {/* Firebase ID indicator for admin/educator */}
                    {userRole !== 'learner' && course.firebaseId && (
                      <div className="mt-1 text-xs text-gray-400">
                        ID: {course.firebaseId.substring(0, 6)}...
                      </div>
                    )}

                    {/* Enhanced Action Button */}
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                          onCourseSelect(course.id);
                          console.log(`Selected course: ID=${course.id}, FirebaseID=${course.firebaseId || 'none'}`);
                        }}
                      >
                        {userRole === 'learner' ? 'Enroll Now' : 'View Course'}
                        <BookOpen className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
