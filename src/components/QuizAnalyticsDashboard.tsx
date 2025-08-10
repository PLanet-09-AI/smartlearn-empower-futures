import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { quizService } from "@/services/quizService";
import { 
  QuizAnalytics, 
  QuestionAnalytics, 
  UserQuizResult, 
  ScoreDistribution 
} from "@/types";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from "recharts";
import { 
  Award, 
  CheckCircle, 
  Download, 
  Eye, 
  Loader2, 
  RefreshCw,
  Search, 
  User, 
  Users, 
  X 
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { format } from "date-fns";

interface QuizAnalyticsDashboardProps {
  courseId?: string;
  isAdmin?: boolean;
}

const QuizAnalyticsDashboard = ({ courseId, isAdmin = false }: QuizAnalyticsDashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUserResult, setSelectedUserResult] = useState<UserQuizResult | null>(null);

  // Colors for charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  const SCORE_COLORS = {
    excellent: "#10b981", // Green
    good: "#3b82f6",      // Blue
    average: "#f59e0b",   // Amber
    poor: "#ef4444"       // Red
  };

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let result;
      
      if (courseId) {
        result = await quizService.getCourseQuizAnalytics(courseId);
      } else {
        const allAnalytics = await quizService.getQuizAnalytics();
        result = allAnalytics.length > 0 ? allAnalytics[0] : null;
      }
      
      setAnalytics(result);
      
      if (!result) {
        toast({
          title: "No quiz data available",
          description: "No completed quizzes found for this course.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading quiz analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz analytics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = () => {
    loadAnalytics();
    toast({
      title: "Refreshing Analytics",
      description: "Fetching the latest quiz data..."
    });
  };

  const exportData = () => {
    if (!analytics) return;
    
    // Create a CSV string
    const rows = [
      // Headers
      [
        "Quiz ID",
        "Course Name",
        "Total Attempts",
        "Average Score",
        "Excellent Scores",
        "Good Scores",
        "Average Scores", 
        "Poor Scores",
        "Date Generated"
      ].join(","),
      // Data
      [
        analytics.quizId,
        analytics.courseName,
        analytics.totalAttempts,
        analytics.averageScore + "%",
        analytics.scoreDistribution.excellent,
        analytics.scoreDistribution.good,
        analytics.scoreDistribution.average,
        analytics.scoreDistribution.poor,
        new Date().toISOString()
      ].join(",")
    ];
    
    // Add user results
    rows.push("\n\nUser Results");
    rows.push(["User", "Score", "Time Taken (mm:ss)", "Date"].join(","));
    
    analytics.userResults.forEach(user => {
      const minutes = Math.floor(user.timeTaken / 60000);
      const seconds = Math.floor((user.timeTaken % 60000) / 1000);
      const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      rows.push([
        user.userName,
        user.score + "%",
        timeFormatted,
        user.attemptedAt ? new Date(user.attemptedAt).toLocaleDateString() : "Unknown"
      ].join(","));
    });
    
    // Add question analytics
    rows.push("\n\nQuestion Analytics");
    rows.push(["Question", "Correct %", "Correct Count", "Incorrect Count"].join(","));
    
    analytics.questionAnalytics.forEach(q => {
      rows.push([
        q.questionText.replace(/,/g, ";"), // Replace commas to avoid CSV issues
        q.correctPercentage + "%",
        q.correctCount,
        q.incorrectCount
      ].join(","));
    });
    
    // Create and download the file
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-analytics-${analytics.courseName.replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Quiz analytics data has been downloaded as a CSV file."
    });
  };

  const filteredUsers = analytics?.userResults.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <p className="text-lg text-gray-600">Loading quiz analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Analytics</CardTitle>
          <CardDescription>
            Detailed analysis of quiz performance
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">No quiz data available for analysis</p>
            <Button onClick={refreshAnalytics} variant="outline" className="gap-2">
              <RefreshCw size={16} />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format dates for the attempts chart
  const attemptsChartData = Object.entries(analytics.attemptsByDate)
    .map(([date, count]) => ({
      date,
      attempts: count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Format data for score distribution chart
  const scoreDistributionData = [
    { name: "Excellent (90-100%)", value: analytics.scoreDistribution.excellent, color: SCORE_COLORS.excellent },
    { name: "Good (70-89%)", value: analytics.scoreDistribution.good, color: SCORE_COLORS.good },
    { name: "Average (50-69%)", value: analytics.scoreDistribution.average, color: SCORE_COLORS.average },
    { name: "Poor (0-49%)", value: analytics.scoreDistribution.poor, color: SCORE_COLORS.poor }
  ];

  // Format data for question performance chart
  const questionPerformanceData = analytics.questionAnalytics.map((q, index) => ({
    name: `Q${index + 1}`,
    correct: q.correctPercentage,
    incorrect: 100 - q.correctPercentage,
    fullText: q.questionText
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-purple-600" />
              Quiz Analytics Dashboard
            </CardTitle>
            <CardDescription>
              {analytics.courseName} - {analytics.totalAttempts} attempt{analytics.totalAttempts !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={refreshAnalytics} variant="outline" size="sm" className="gap-1">
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button onClick={exportData} variant="outline" size="sm" className="gap-1">
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold mb-2">{analytics.averageScore}%</div>
                    <Progress 
                      value={analytics.averageScore} 
                      className="h-2 w-full" 
                      indicatorClassName={analytics.averageScore >= 70 ? "bg-green-500" : "bg-amber-500"}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Based on {analytics.totalAttempts} quiz attempts
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                        >
                          {scoreDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Quiz Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attemptsChartData}>
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="attempts" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Summary Stats */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Quiz Performance Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-md border">
                  <p className="text-sm text-gray-500">Excellent (90-100%)</p>
                  <p className="text-xl font-bold">{analytics.scoreDistribution.excellent}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.totalAttempts > 0 
                      ? `${Math.round((analytics.scoreDistribution.excellent / analytics.totalAttempts) * 100)}%` 
                      : "0%"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-md border">
                  <p className="text-sm text-gray-500">Good (70-89%)</p>
                  <p className="text-xl font-bold">{analytics.scoreDistribution.good}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.totalAttempts > 0 
                      ? `${Math.round((analytics.scoreDistribution.good / analytics.totalAttempts) * 100)}%` 
                      : "0%"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-md border">
                  <p className="text-sm text-gray-500">Average (50-69%)</p>
                  <p className="text-xl font-bold">{analytics.scoreDistribution.average}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.totalAttempts > 0 
                      ? `${Math.round((analytics.scoreDistribution.average / analytics.totalAttempts) * 100)}%` 
                      : "0%"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-md border">
                  <p className="text-sm text-gray-500">Poor (0-49%)</p>
                  <p className="text-xl font-bold">{analytics.scoreDistribution.poor}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.totalAttempts > 0 
                      ? `${Math.round((analytics.scoreDistribution.poor / analytics.totalAttempts) * 100)}%` 
                      : "0%"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {analytics.totalAttempts > 0 && (
                    analytics.averageScore >= 70 
                      ? "Overall performance is good. Most students are understanding the material well."
                      : "Overall performance indicates students may need additional support with key concepts."
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-8">
            {/* Question Performance Chart */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-6">Question Performance</h3>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={questionPerformanceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value}%`, name === "correct" ? "Correct" : "Incorrect"]}
                      labelFormatter={(value) => `Question ${value.substring(1)}`}
                    />
                    <Legend />
                    <Bar dataKey="correct" fill="#82ca9d" name="Correct" stackId="stack" />
                    <Bar dataKey="incorrect" fill="#ff8042" name="Incorrect" stackId="stack" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Question Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Question Details</h3>
              
              {analytics.questionAnalytics.map((question, index) => (
                <Card key={question.questionId} className="overflow-hidden">
                  <div className={`h-2 ${
                    question.correctPercentage >= 70 ? "bg-green-500" : 
                    question.correctPercentage >= 50 ? "bg-amber-500" : 
                    "bg-red-500"
                  }`}></div>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="text-md font-medium">Question {index + 1}</h4>
                      <Badge className={
                        question.correctPercentage >= 70 ? "bg-green-100 text-green-800" : 
                        question.correctPercentage >= 50 ? "bg-amber-100 text-amber-800" : 
                        "bg-red-100 text-red-800"
                      }>
                        {question.correctPercentage}% Correct
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{question.questionText}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Correct Answer:</p>
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <p>{question.correctAnswerText}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-1">Response Breakdown:</p>
                      <div className="space-y-1">
                        {Object.entries(question.optionCounts).map(([optionId, count]) => {
                          const isCorrect = question.correctAnswerText === 
                            analytics.userResults.find(u => 
                              u.answers.find(a => 
                                a.questionId === question.questionId && 
                                a.selectedOption.includes(`Option ${parseInt(optionId) + 1}`)
                              )
                            )?.answers.find(a => a.questionId === question.questionId)?.correctOption;
                            
                          const percentage = Math.round((count / (question.correctCount + question.incorrectCount)) * 100);
                          
                          return (
                            <div key={optionId} className="flex items-center gap-2">
                              <div className="w-[60px] text-sm">{percentage}%</div>
                              <Progress 
                                value={percentage} 
                                className="h-2 flex-1" 
                                indicatorClassName={isCorrect ? "bg-green-500" : "bg-gray-300"}
                              />
                              {isCorrect && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Completion Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      // Format time taken
                      const minutes = Math.floor(user.timeTaken / 60000);
                      const seconds = Math.floor((user.timeTaken % 60000) / 1000);
                      const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                      
                      return (
                        <TableRow key={user.userId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{user.userName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              user.score >= 90 ? "bg-green-100 text-green-800" : 
                              user.score >= 70 ? "bg-blue-100 text-blue-800" : 
                              user.score >= 50 ? "bg-amber-100 text-amber-800" : 
                              "bg-red-100 text-red-800"
                            }>
                              {user.score}%
                            </Badge>
                          </TableCell>
                          <TableCell>{timeFormatted}</TableCell>
                          <TableCell>
                            {user.attemptedAt ? 
                              format(new Date(user.attemptedAt), 'MMM d, yyyy') : 
                              'Unknown'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setSelectedUserResult(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Quiz Results: {user.userName}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6 py-4">
                                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="text-sm text-gray-500">Student</div>
                                      <div className="font-medium">{user.userName}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500">Score</div>
                                      <div className="font-medium">{user.score}%</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500">Time Taken</div>
                                      <div className="font-medium">{timeFormatted}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500">Date</div>
                                      <div className="font-medium">
                                        {user.attemptedAt ? 
                                          format(new Date(user.attemptedAt), 'MMM d, yyyy') : 
                                          'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h3 className="font-medium mb-4">Question Responses</h3>
                                    
                                    <div className="space-y-6">
                                      {user.answers.length === 0 ? (
                                        <Alert>
                                          <AlertTitle>No answer data available</AlertTitle>
                                          <AlertDescription>
                                            Detailed answer data could not be found for this attempt.
                                          </AlertDescription>
                                        </Alert>
                                      ) : (
                                        user.answers.map((answer, index) => (
                                          <div key={answer.questionId} className="border rounded-lg overflow-hidden">
                                            <div className={`h-1 ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div className="p-4">
                                              <div className="flex items-center gap-2 mb-2">
                                                <div className="font-medium">Question {index + 1}</div>
                                                {answer.isCorrect ? (
                                                  <Badge className="bg-green-100 text-green-800">Correct</Badge>
                                                ) : (
                                                  <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
                                                )}
                                              </div>
                                              
                                              <p className="text-gray-700 mb-4">{answer.questionText}</p>
                                              
                                              <div className="mb-2">
                                                <div className="text-sm font-medium">Student Answer:</div>
                                                <div className={`flex items-center gap-2 p-2 rounded ${
                                                  answer.isCorrect 
                                                    ? 'bg-green-50 text-green-800' 
                                                    : 'bg-red-50 text-red-800'
                                                }`}>
                                                  {answer.isCorrect 
                                                    ? <CheckCircle className="h-4 w-4" />
                                                    : <X className="h-4 w-4" />
                                                  }
                                                  <span>{answer.selectedOption}</span>
                                                </div>
                                              </div>
                                              
                                              {!answer.isCorrect && (
                                                <div>
                                                  <div className="text-sm font-medium">Correct Answer:</div>
                                                  <div className="flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>{answer.correctOption}</span>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {answer.explanation && (
                                                <div className="mt-2 p-3 bg-slate-50 rounded-md">
                                                  <p className="text-sm font-medium">Explanation:</p>
                                                  <p className="text-sm text-slate-700">{answer.explanation}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuizAnalyticsDashboard;
