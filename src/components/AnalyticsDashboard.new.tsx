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
    role: string;
    count: number;
    color: string;
  }[];
}

interface CourseData {
  total: number;
  published: number;
  draft: number;
  archived: number;
  averageRating: number;
  totalRatings: number;
  mostPopular: {
    title: string;
    students: number;
  } | null;
  coursesByMonth: {
    month: string;
    count: number;
  }[];
  coursesByCategory: {
    category: string;
    count: number;
    color: string;
  }[];
}

interface EnrollmentData {
  total: number;
  active: number;
  completed: number;
  dropped: number;
  completionRate: number;
  enrollmentsByMonth: {
    month: string;
    count: number;
  }[];
  topCourses: {
    title: string;
    enrollments: number;
  }[];
}

interface ProgressData {
  totalUsers: number;
  usersWithProgress: number;
  averageCompletion: number;
  completedCourses: number;
  progressDistribution: {
    range: string;
    count: number;
    color: string;
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
  archived: 0,
  averageRating: 0,
  totalRatings: 0,
  mostPopular: null,
  coursesByMonth: [],
  coursesByCategory: []
};

const initialEnrollmentData: EnrollmentData = {
  total: 0,
  active: 0,
  completed: 0,
  dropped: 0,
  completionRate: 0,
  enrollmentsByMonth: [],
  topCourses: []
};

const initialProgressData: ProgressData = {
  totalUsers: 0,
  usersWithProgress: 0,
  averageCompletion: 0,
  completedCourses: 0,
  progressDistribution: []
};

const AnalyticsDashboard = () => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [courseData, setCourseData] = useState<CourseData>(initialCourseData);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>(initialEnrollmentData);
  const [progressData, setProgressData] = useState<ProgressData>(initialProgressData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [users, courses, enrollments, progress] = await Promise.all([
        db.getAll("users"),
        db.getAll("courses"),
        db.getAll("enrollments"),
        db.getAll("userProgress")
      ]);

      // Process user data
      const processedUserData = processUserAnalytics(users);
      setUserData(processedUserData);

      // Process course data
      const processedCourseData = processCourseAnalytics(courses);
      setCourseData(processedCourseData);

      // Process enrollment data
      const processedEnrollmentData = processEnrollmentAnalytics(enrollments, courses);
      setEnrollmentData(processedEnrollmentData);

      // Process progress data
      const processedProgressData = processProgressAnalytics(progress);
      setProgressData(processedProgressData);

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processUserAnalytics = (users: any[]): UserData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const roleData = {
      learners: users.filter(u => u.role === 'student').length,
      educators: users.filter(u => u.role === 'lecturer').length,
      admins: users.filter(u => u.role === 'admin').length
    };

    const usersByRole = [
      { role: 'Students', count: roleData.learners, color: '#8884d8' },
      { role: 'Lecturers', count: roleData.educators, color: '#82ca9d' },
      { role: 'Admins', count: roleData.admins, color: '#ffc658' }
    ];

    return {
      total: users.length,
      ...roleData,
      activeLastWeek: users.filter(u => u.lastLogin && new Date(u.lastLogin) > oneWeekAgo).length,
      activeLastMonth: users.filter(u => u.lastLogin && new Date(u.lastLogin) > oneMonthAgo).length,
      newLastWeek: users.filter(u => u.createdAt && new Date(u.createdAt) > oneWeekAgo).length,
      newLastMonth: users.filter(u => u.createdAt && new Date(u.createdAt) > oneMonthAgo).length,
      usersByMonth: generateMonthlyData(users, 'createdAt'),
      usersByRole
    };
  };

  const processCourseAnalytics = (courses: any[]): CourseData => {
    const statusData = {
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length,
      archived: courses.filter(c => c.status === 'archived').length
    };

    const ratingsData = courses.filter(c => c.rating && c.ratingCount);
    const averageRating = ratingsData.length > 0 
      ? ratingsData.reduce((sum, c) => sum + (c.rating || 0), 0) / ratingsData.length 
      : 0;
    const totalRatings = ratingsData.reduce((sum, c) => sum + (c.ratingCount || 0), 0);

    const mostPopular = courses.reduce((max, course) => 
      (course.students || 0) > (max?.students || 0) ? course : max, null);

    const categoryData = courses.reduce((acc, course) => {
      const category = course.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const coursesByCategory = Object.entries(categoryData).map(([category, count], index) => ({
      category,
      count: count as number,
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]
    }));

    return {
      total: courses.length,
      ...statusData,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      mostPopular: mostPopular ? { title: mostPopular.title, students: mostPopular.students } : null,
      coursesByMonth: generateMonthlyData(courses, 'createdAt'),
      coursesByCategory
    };
  };

  const processEnrollmentAnalytics = (enrollments: any[], courses: any[]): EnrollmentData => {
    const statusData = {
      active: enrollments.filter(e => e.status === 'active').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length
    };

    const completionRate = enrollments.length > 0 
      ? (statusData.completed / enrollments.length) * 100 
      : 0;

    const courseEnrollmentCounts = enrollments.reduce((acc, enrollment) => {
      acc[enrollment.courseId] = (acc[enrollment.courseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCourses = Object.entries(courseEnrollmentCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([courseId, count]) => {
        const course = courses.find(c => c.id === courseId);
        return {
          title: course?.title || 'Unknown Course',
          enrollments: count as number
        };
      });

    return {
      total: enrollments.length,
      ...statusData,
      completionRate: Math.round(completionRate * 10) / 10,
      enrollmentsByMonth: generateMonthlyData(enrollments, 'enrollmentDate'),
      topCourses
    };
  };

  const processProgressAnalytics = (progress: any[]): ProgressData => {
    const usersWithProgress = new Set(progress.map(p => p.userId)).size;
    const averageCompletion = progress.length > 0 
      ? progress.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / progress.length 
      : 0;
    const completedCourses = progress.filter(p => p.completionPercentage === 100).length;

    const progressRanges = [
      { range: '0-20%', min: 0, max: 20, color: '#ff4444' },
      { range: '21-40%', min: 21, max: 40, color: '#ff8800' },
      { range: '41-60%', min: 41, max: 60, color: '#ffcc00' },
      { range: '61-80%', min: 61, max: 80, color: '#88cc00' },
      { range: '81-100%', min: 81, max: 100, color: '#44cc44' }
    ];

    const progressDistribution = progressRanges.map(range => ({
      range: range.range,
      count: progress.filter(p => 
        (p.completionPercentage || 0) >= range.min && 
        (p.completionPercentage || 0) <= range.max
      ).length,
      color: range.color
    }));

    return {
      totalUsers: usersWithProgress,
      usersWithProgress,
      averageCompletion: Math.round(averageCompletion * 10) / 10,
      completedCourses,
      progressDistribution
    };
  };

  const generateMonthlyData = (items: any[], dateField: string) => {
    const monthCounts = items.reduce((acc, item) => {
      if (item[dateField]) {
        const date = new Date(item[dateField]);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, count]) => ({ month, count: count as number }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Data
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{userData.newLastMonth} new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseData.total}</div>
                <p className="text-xs text-muted-foreground">
                  {courseData.published} published
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollmentData.total}</div>
                <p className="text-xs text-muted-foreground">
                  {enrollmentData.completionRate}% completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseData.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  From {courseData.totalRatings} ratings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userData.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, count }) => `${role}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {userData.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Active Last Week</span>
                    <span>{userData.activeLastWeek}/{userData.total}</span>
                  </div>
                  <Progress value={(userData.activeLastWeek / userData.total) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Active Last Month</span>
                    <span>{userData.activeLastMonth}/{userData.total}</span>
                  </div>
                  <Progress value={(userData.activeLastMonth / userData.total) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Courses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseData.coursesByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{courseData.published}</div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{courseData.draft}</div>
                    <div className="text-sm text-muted-foreground">Draft</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{courseData.archived}</div>
                    <div className="text-sm text-muted-foreground">Archived</div>
                  </div>
                </div>
                {courseData.mostPopular && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium">Most Popular Course</div>
                    <div className="text-sm text-muted-foreground">
                      {courseData.mostPopular.title} ({courseData.mostPopular.students} students)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Courses by Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrollmentData.topCourses.map((course, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate">{course.title}</span>
                      <Badge variant="secondary">{course.enrollments}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Active</span>
                    <span>{enrollmentData.active}</span>
                  </div>
                  <Progress value={(enrollmentData.active / enrollmentData.total) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Completed</span>
                    <span>{enrollmentData.completed}</span>
                  </div>
                  <Progress value={(enrollmentData.completed / enrollmentData.total) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Dropped</span>
                    <span>{enrollmentData.dropped}</span>
                  </div>
                  <Progress value={(enrollmentData.dropped / enrollmentData.total) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData.progressDistribution}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{progressData.usersWithProgress}</div>
                    <div className="text-sm text-muted-foreground">Users with Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{progressData.completedCourses}</div>
                    <div className="text-sm text-muted-foreground">Completed Courses</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span>Average Completion</span>
                    <span>{progressData.averageCompletion}%</span>
                  </div>
                  <Progress value={progressData.averageCompletion} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
