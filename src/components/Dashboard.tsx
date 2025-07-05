
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, TrendingUp, Clock, Play, Award, Settings, FileQuestion, BarChart3 } from "lucide-react";
import CourseLibrary from "./CourseLibrary";
import CourseContent from "./CourseContent";
import CourseManagement from "./CourseManagement";
import VoiceCommand from "./VoiceCommand";
import { courses as initialCourses } from "@/data/courses";

interface DashboardProps {
  userRole: 'learner' | 'educator' | 'admin';
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
  content?: any[];
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Calculate real stats from courses data
  const getTotalStudents = () => {
    return courses.reduce((total, course) => total + course.students, 0);
  };

  const getCoursesCreated = () => {
    return courses.length;
  };

  const getAverageRating = () => {
    const validRatings = courses.filter(course => course.rating > 0);
    if (validRatings.length === 0) return 0;
    const total = validRatings.reduce((sum, course) => sum + course.rating, 0);
    return (total / validRatings.length).toFixed(1);
  };

  const getTopCourses = () => {
    return courses
      .sort((a, b) => b.students - a.students)
      .slice(0, 2);
  };

  // Mock user data with real course stats
  const userData = {
    name: userRole === 'admin' ? 'Admin User' : userRole === 'educator' ? 'Dr. Sarah Johnson' : 'John Doe',
    enrolledCourses: userRole === 'learner' ? 3 : 0,
    completedCourses: userRole === 'learner' ? 1 : 0,
    certificationsEarned: userRole === 'learner' ? 2 : 0,
    totalStudents: getTotalStudents(),
    coursesCreated: getCoursesCreated(),
    averageRating: getAverageRating(),
  };

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab("course-content");
  };

  const handleCoursesUpdate = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setActiveTab("courses");
  };

  // Quick stats based on user role with real data
  const getQuickStats = () => {
    if (userRole === 'learner') {
      return [
        { title: "Enrolled Courses", value: userData.enrolledCourses, icon: BookOpen },
        { title: "Completed", value: userData.completedCourses, icon: Award },
        { title: "Certificates", value: userData.certificationsEarned, icon: Award },
        { title: "Study Hours", value: "24", icon: Clock },
      ];
    } else {
      return [
        { title: "Total Students", value: userData.totalStudents, icon: Users },
        { title: "Courses Created", value: userData.coursesCreated, icon: BookOpen },
        { title: "Avg. Rating", value: userData.averageRating, icon: TrendingUp },
        { title: "Active Courses", value: courses.filter(c => c.students > 0).length, icon: BarChart3 },
      ];
    }
  };

  if (selectedCourseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CourseContent 
          courseId={selectedCourseId} 
          onBack={handleBackToCourses}
          userRole={userRole}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userData.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {userRole === 'learner' 
                  ? "Continue your learning journey" 
                  : userRole === 'educator'
                  ? "Manage your courses and students"
                  : "Oversee the entire platform"
                }
              </p>
            </div>
            <VoiceCommand />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {userRole === 'learner' ? 'Browse Courses' : 'Course Library'}
            </TabsTrigger>
            {(userRole === 'educator' || userRole === 'admin') && (
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Courses
              </TabsTrigger>
            )}
            {userRole === 'admin' && (
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getQuickStats().map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity / Current Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userRole === 'learner' ? (
                <>
                  {/* Current Courses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Continue Learning</CardTitle>
                      <CardDescription>Pick up where you left off</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Data Analytics Fundamentals</p>
                              <p className="text-sm text-gray-500">Module 3 of 7</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Web Development Bootcamp</p>
                              <p className="text-sm text-gray-500">Module 1 of 12</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Achievements</CardTitle>
                      <CardDescription>Your learning milestones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Course Completed</p>
                          <p className="text-sm text-gray-500">Digital Marketing Mastery</p>
                        </div>
                        <Badge variant="secondary">New</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Quiz Master</p>
                          <p className="text-sm text-gray-500">Scored 95% on final quiz</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Recent Student Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Student Activity</CardTitle>
                      <CardDescription>Latest enrollments and completions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            JS
                          </div>
                          <div>
                            <p className="font-medium">John Smith enrolled</p>
                            <p className="text-sm text-gray-500">{courses[0]?.title || 'Course'}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            MJ
                          </div>
                          <div>
                            <p className="font-medium">Maria Johnson completed</p>
                            <p className="text-sm text-gray-500">{courses[1]?.title || 'Course'}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">1 day ago</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Courses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Top Courses</CardTitle>
                      <CardDescription>Most popular courses by enrollment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {getTopCourses().map((course, index) => (
                        <div key={course.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.students} students • {course.rating > 0 ? `${course.rating}/5 rating` : 'No ratings yet'}</p>
                          </div>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {index === 0 ? "Most Popular" : "Rising"}
                          </Badge>
                        </div>
                      ))}
                      {getTopCourses().length === 0 && (
                        <p className="text-sm text-gray-500">No courses created yet</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CourseLibrary 
              userRole={userRole} 
              onCourseSelect={handleCourseSelect}
              courses={courses}
            />
          </TabsContent>

          {/* Course Management Tab (Educators and Admins only) */}
          {(userRole === 'educator' || userRole === 'admin') && (
            <TabsContent value="management">
              <CourseManagement 
                userRole={userRole} 
                onCoursesUpdate={handleCoursesUpdate}
              />
            </TabsContent>
          )}

          {/* Analytics Tab (Admin only) */}
          {userRole === 'admin' && (
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>Key metrics and performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Students</span>
                      <span className="font-semibold">{userData.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Courses</span>
                      <span className="font-semibold">{userData.coursesCreated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Rating</span>
                      <span className="font-semibold">{userData.averageRating}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Popular Courses</span>
                      <span className="font-semibold">{courses.filter(c => c.students > 50).length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>Enrollment trends by course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {courses.slice(0, 3).map((course, index) => (
                        <div key={course.id}>
                          <div className="flex justify-between">
                            <span className="text-sm truncate">{course.title}</span>
                            <span className="text-sm font-medium">{course.students} students</span>
                          </div>
                          <Progress 
                            value={(course.students / Math.max(...courses.map(c => c.students), 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                      {courses.length === 0 && (
                        <p className="text-sm text-gray-500">No courses available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
