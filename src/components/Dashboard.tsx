import { BookOpen, Users, BarChart3, Settings, Award, Clock, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import CourseLibrary from "@/components/CourseLibrary";
import CourseManagement from "@/components/CourseManagement";
import CourseContent from "@/components/CourseContent";
import { useState } from "react";
import VoiceCommand from "@/components/VoiceCommand";

interface DashboardProps {
  userRole: 'learner' | 'educator' | 'admin';
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-content');
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setActiveTab('courses');
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('course') || lowerCommand.includes('library')) {
      setActiveTab('courses');
    } else if (lowerCommand.includes('manage') && (userRole === 'educator' || userRole === 'admin')) {
      setActiveTab('manage');
    } else if (lowerCommand.includes('overview') || lowerCommand.includes('dashboard')) {
      setActiveTab('overview');
    }
  };

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'learner':
        return 'Welcome to your learning journey!';
      case 'educator':
        return 'Welcome, Educator! Ready to inspire minds?';
      case 'admin':
        return 'Welcome, Administrator! Manage your learning platform.';
      default:
        return 'Welcome to SmartLearn!';
    }
  };

  const getLearnerStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">+2 new this month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">73%</div>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42h</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+3 new achievements</p>
        </CardContent>
      </Card>
    </div>
  );

  const getCurrentCourses = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Current Courses</CardTitle>
        <CardDescription>Continue your learning journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { name: "Data Analytics Fundamentals", progress: 85, badge: "Advanced", nextLesson: "Statistical Analysis" },
          { name: "Web Development Basics", progress: 60, badge: "Intermediate", nextLesson: "React Components" },
          { name: "Digital Marketing Strategy", progress: 30, badge: "Beginner", nextLesson: "SEO Fundamentals" },
        ].map((course, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{course.name}</h4>
              <Badge variant={course.badge === 'Beginner' ? 'secondary' : course.badge === 'Intermediate' ? 'default' : 'destructive'}>
                {course.badge}
              </Badge>
            </div>
            <Progress value={course.progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{course.progress}% complete</span>
              <span>Next: {course.nextLesson}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const getEducatorStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">156</div>
          <p className="text-xs text-muted-foreground">+12 new this week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">3 drafts pending</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.8</div>
          <p className="text-xs text-muted-foreground">Across all courses</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,450</div>
          <p className="text-xs text-muted-foreground">+18% from last month</p>
        </CardContent>
      </Card>
    </div>
  );

  const getAdminStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,543</div>
          <p className="text-xs text-muted-foreground">+12% this month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">Across all categories</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">87%</div>
          <p className="text-xs text-muted-foreground">Weekly active users</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Good</div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </CardContent>
      </Card>
    </div>
  );

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'courses', label: 'Course Library' }
    ];

    if (userRole === 'educator' || userRole === 'admin') {
      baseTabs.push({ id: 'manage', label: 'Manage Courses' });
    }

    return baseTabs;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getWelcomeMessage()}</h1>
          <p className="text-gray-600">Track your progress and explore new learning opportunities.</p>
        </div>
        <VoiceCommand 
          onCommand={handleVoiceCommand}
          commands={{
            'create course': () => userRole !== 'learner' && setActiveTab('manage'),
            'new course': () => userRole !== 'learner' && setActiveTab('manage'),
          }}
          className="hidden sm:flex"
        />
      </div>

      {/* Navigation Tabs */}
      {activeTab !== 'course-content' && (
        <div className="flex space-x-6 mb-6 border-b border-gray-200">
          {getTabsForRole().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {userRole === 'learner' && (
            <>
              {getLearnerStats()}
              {getCurrentCourses()}
            </>
          )}
          
          {userRole === 'educator' && (
            <>
              {getEducatorStats()}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quick Actions</span>
                    <Button onClick={() => setActiveTab('manage')} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Course
                    </Button>
                  </CardTitle>
                  <CardDescription>Manage your courses and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Recent Course Activity</h4>
                      <p className="text-sm text-gray-600">5 new enrollments this week</p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Pending Reviews</h4>
                      <p className="text-sm text-gray-600">3 assignments to grade</p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Course Feedback</h4>
                      <p className="text-sm text-gray-600">2 new reviews received</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {userRole === 'admin' && (
            <>
              {getAdminStats()}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>Key metrics and performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Course Completion Rate</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-medium">4.6/5</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platform Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform updates and activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">New course "AI Ethics" published</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">System maintenance completed</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">45 new user registrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Monthly analytics report generated</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <CourseLibrary userRole={userRole} onCourseSelect={handleCourseSelect} />
      )}
      
      {activeTab === 'manage' && (userRole === 'educator' || userRole === 'admin') && (
        <CourseManagement userRole={userRole} />
      )}

      {activeTab === 'course-content' && selectedCourseId && (
        <CourseContent 
          courseId={selectedCourseId} 
          onBack={handleBackToCourses}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default Dashboard;
