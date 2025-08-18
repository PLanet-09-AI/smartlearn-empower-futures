import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { db } from "@/lib/database";
import { Loader2, Users, BookOpen, Award, TrendingUp, Activity, Calendar } from "lucide-react";

// Define types
interface UserData {
  total: number;
  learners: number;
  educators: number;
  admins: number;
  activeLastWeek: number;
  activeLastMonth: number;
  newLastWeek: number;
  newLastMonth: number;
  usersByMonth: {
    month: string;
    count: number;
  }[];
  usersByRole: {
    name: string;
    value: number;
    color: string;
  }[];
}

interface CourseData {
  total: number;
  published: number;
  draft: number;
  totalEnrollments: number;
  averageRating: number;
  averageCompletion: number;
  mostPopular: {
    id: string;
    title: string;
    enrollments: number;
  }[];
  coursesByRating: {
    name: string;
    rating: number;
    enrollments: number;
  }[];
}

const initialUserData: UserData = {
  total: 0,
  learners: 0,
  educators: 0,
  admins: 0,
  activeLastWeek: 0,
  activeLastMonth: 0,
  newLastWeek: 0,
  newLastMonth: 0,
  usersByMonth: [],
  usersByRole: []
};

const initialCourseData: CourseData = {
  total: 0,
  published: 0,
  draft: 0,
  totalEnrollments: 0,
  averageRating: 0,
  averageCompletion: 0,
  mostPopular: [],
  coursesByRating: []
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [courseData, setCourseData] = useState<CourseData>(initialCourseData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        // Fetch users data
        await fetchUserData();
        
        // Fetch courses data
        await fetchCourseData();
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      // Get all users from Firestore
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const users = userSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as any)
      }));
      
      console.log("Fetched users for analytics:", users.length);
      
      // Calculate total users by role
      const learners = users.filter(user => user.role === 'learner').length;
      const educators = users.filter(user => user.role === 'educator').length;
      const admins = users.filter(user => user.role === 'admin').length;
      
      // Calculate users by signup date
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const newLastWeek = users.filter(user => {
        if (!user.createdAt) return false;
        const createdAt = new Date(user.createdAt.seconds * 1000);
        return createdAt >= oneWeekAgo;
      }).length;
      
      const newLastMonth = users.filter(user => {
        if (!user.createdAt) return false;
        const createdAt = new Date(user.createdAt.seconds * 1000);
        return createdAt >= oneMonthAgo;
      }).length;
      
      // Calculate active users (this is a placeholder as we don't track logins in this example)
      // In a real app, you'd query login history or activity logs
      const activeLastWeek = Math.floor(users.length * 0.7); // Assuming 70% active
      const activeLastMonth = Math.floor(users.length * 0.85); // Assuming 85% active
      
      // Calculate users by month
      const usersByMonth = calculateUsersByMonth(users);
      
      // Create data for role pie chart
      const usersByRole = [
        { name: 'Learners', value: learners, color: '#4ade80' },
        { name: 'Educators', value: educators, color: '#60a5fa' },
        { name: 'Admins', value: admins, color: '#f87171' }
      ];
      
      setUserData({
        total: users.length,
        learners,
        educators,
        admins,
        activeLastWeek,
        activeLastMonth,
        newLastWeek,
        newLastMonth,
        usersByMonth,
        usersByRole
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw error;
    }
  };
  
  const fetchCourseData = async () => {
    try {
      // Get courses from Firestore
      const coursesCollection = collection(db, "courses");
      const courseSnapshot = await getDocs(coursesCollection);
      const courses = courseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      
      console.log("Fetched courses for analytics:", courses.length);
      
      // Calculate course metrics
      const published = courses.filter(course => (course as any).status === 'published').length;
      const draft = courses.filter(course => (course as any).status !== 'published').length;
      
      // Get enrollments data
      const enrollmentsCollection = collection(db, "enrollments");
      const enrollmentSnapshot = await getDocs(enrollmentsCollection);
      const enrollments = enrollmentSnapshot.docs.map(doc => doc.data() as any);
      
      // Get course enrollments
      const coursesWithEnrollments = courses.map(course => {
        const courseEnrollments = enrollments.filter(e => e.courseId === course.id).length;
        return {
          ...course,
          enrollments: courseEnrollments
        } as any;
      });
      
      // Calculate total enrollments
      const totalEnrollments = enrollments.length;
      
      // Get course ratings
      let totalRating = 0;
      let ratedCoursesCount = 0;
      
      coursesWithEnrollments.forEach(course => {
        if (course.rating && course.rating > 0) {
          totalRating += course.rating;
          ratedCoursesCount++;
        }
      });
      
      const averageRating = ratedCoursesCount > 0
        ? parseFloat((totalRating / ratedCoursesCount).toFixed(1))
        : 0;
      
      // Get most popular courses
      const mostPopular = [...coursesWithEnrollments]
        .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0))
        .slice(0, 5)
        .map(course => ({
          id: course.id,
          title: course.title || 'Untitled Course',
          enrollments: course.enrollments || 0
        }));
      
      // Get courses by rating
      const coursesByRating = coursesWithEnrollments
        .filter(course => course.rating && course.enrollments)
        .map(course => ({
          name: course.title?.substring(0, 20) + (course.title?.length > 20 ? '...' : '') || 'Untitled',
          rating: course.rating || 0,
          enrollments: course.enrollments || 0
        }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      
      // Calculate average completion rate
      const progressCollection = collection(db, "userProgress");
      const progressSnapshot = await getDocs(progressCollection);
      const progressEntries = progressSnapshot.docs.map(doc => doc.data());
      
      let totalCompletion = 0;
      
      progressEntries.forEach(entry => {
        if (entry.completionPercentage) {
          totalCompletion += entry.completionPercentage;
        }
      });
      
      const averageCompletion = progressEntries.length > 0
        ? parseFloat((totalCompletion / progressEntries.length).toFixed(1))
        : 0;
      
      setCourseData({
        total: courses.length,
        published,
        draft,
        totalEnrollments,
        averageRating,
        averageCompletion,
        mostPopular,
        coursesByRating
      });
    } catch (error) {
      console.error("Error fetching course analytics:", error);
      throw error;
    }
  };
  
  // Helper function to calculate users by month
  const calculateUsersByMonth = (users: any[]) => {
    const monthCounts = {};
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Get the last 6 months
    const today = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
      const monthLabel = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
      last6Months.push({ key: monthKey, label: monthLabel });
      monthCounts[monthKey] = 0;
    }
    
    // Count users by signup month
    users.forEach(user => {
      const createdAt = new Date(user.createdAt.seconds * 1000);
      const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      
      if (monthCounts[monthKey] !== undefined) {
        monthCounts[monthKey] += 1;
      }
    });
    
    // Convert to array format needed for charts
    return last6Months.map(month => ({
      month: month.label,
      count: monthCounts[month.key]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userData.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    +{userData.newLastMonth} in last 30 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userData.activeLastWeek}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Last 7 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  New Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userData.newLastWeek}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    Last 7 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {userData.total > 0
                    ? Math.round((userData.newLastMonth / userData.total) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    Last 30 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>
                  Distribution of users across different roles
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userData.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userData.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userData.usersByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${value} users`, 'New Signups']} />
                    <Bar dataKey="count" name="New Users" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>
                Detailed breakdown of user roles and their distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Learners</span>
                    <span className="text-sm font-medium">{userData.learners} ({userData.total > 0 ? Math.round((userData.learners / userData.total) * 100) : 0}%)</span>
                  </div>
                  <Progress 
                    value={userData.total > 0 ? (userData.learners / userData.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Educators</span>
                    <span className="text-sm font-medium">{userData.educators} ({userData.total > 0 ? Math.round((userData.educators / userData.total) * 100) : 0}%)</span>
                  </div>
                  <Progress 
                    value={userData.total > 0 ? (userData.educators / userData.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Admins</span>
                    <span className="text-sm font-medium">{userData.admins} ({userData.total > 0 ? Math.round((userData.admins / userData.total) * 100) : 0}%)</span>
                  </div>
                  <Progress 
                    value={userData.total > 0 ? (userData.admins / userData.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Course Analytics Tab */}
        <TabsContent value="courses" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courseData.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {courseData.published} published
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Total Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courseData.totalEnrollments}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    {Math.round(courseData.totalEnrollments / Math.max(1, courseData.total))} per course
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courseData.averageRating}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    Out of 5.0
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courseData.averageCompletion}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    Average progress
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Most Popular Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Courses</CardTitle>
              <CardDescription>
                Courses with the highest enrollment numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseData.mostPopular.length > 0 ? (
                  courseData.mostPopular.map((course, index) => (
                    <div key={course.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{course.title}</span>
                        <span className="text-sm">{course.enrollments} enrollments</span>
                      </div>
                      <Progress 
                        value={(course.enrollments / Math.max(...courseData.mostPopular.map(c => c.enrollments))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No course enrollment data available</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Course Ratings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Course Ratings</CardTitle>
              <CardDescription>
                Top rated courses by average rating and enrollment
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {courseData.coursesByRating.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseData.coursesByRating}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={100}
                    />
                    <Tooltip formatter={(value) => [value, 'Rating']} />
                    <Legend />
                    <Bar dataKey="rating" name="Rating (out of 5)" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No course rating data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
