import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { quizService } from "@/services/quizService";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { LeaderboardEntry } from "@/types";

interface QuizLeaderboardProps {
  courseId?: string; // Optional - filter by course
}

const QuizLeaderboard = ({ courseId }: QuizLeaderboardProps) => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get leaderboard data from the service
        const entries = await quizService.getLeaderboard(courseId);
        setLeaderboard(entries);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [currentUser, courseId]);
  
  const getTopRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-bold">{index + 1}</span>;
  };
  
  const isCurrentUser = (userId: string) => currentUser && userId === currentUser.uid;
  
  // Format time taken (milliseconds) to a readable format
  const formatTimeTaken = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Quiz Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank against other learners
            </CardDescription>
          </div>
          
          {courseId && (
            <Badge variant="outline" className="text-purple-600">
              Course Specific
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No quiz results found.</p>
            <p className="text-sm mt-2">Be the first to take a quiz and appear on the leaderboard!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>User</TableHead>
                {!courseId && <TableHead>Course</TableHead>}
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Time Taken</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={entry.id} className={isCurrentUser(entry.userId) ? "bg-purple-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      {getTopRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.userName}
                      {isCurrentUser(entry.userId) && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  {!courseId && <TableCell>{entry.courseName}</TableCell>}
                  <TableCell className="text-right font-medium">
                    {entry.score}%
                  </TableCell>
                  <TableCell>
                    {formatTimeTaken(entry.timeTaken)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(entry.attemptedAt), "MMM d, h:mm a")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizLeaderboard;
