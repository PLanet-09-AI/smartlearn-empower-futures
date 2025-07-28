import React, { useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trash2, UserCog, Search, RefreshCw, BookOpen, BarChart3 } from "lucide-react";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { UserProgress } from "@/services/progressService";

interface User {
  uid: string;
  email: string;
  role: 'learner' | 'educator' | 'admin';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface UserWithProgress extends User {
  enrollments?: number;
  completedCourses?: number;
  totalCourses?: number;
  averageProgress?: number;
  progress?: {
    courseId: string;
    courseName: string;
    progress: number;
  }[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithProgress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'learner' | 'educator' | 'admin'>('learner');
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserWithProgress[];
      
      // Fetch enrollment and progress data for all learners
      const learners = userList.filter(user => user.role === 'learner');
      
      // Load progress data for learners
      const usersWithProgress = await Promise.all(
        userList.map(async (user) => {
          // Only fetch progress for learners
          if (user.role !== 'learner') {
            return user;
          }
          
          try {
            // Get user enrollments
            const enrollments = await enrollmentService.getUserEnrollments(user.uid);
            
            if (enrollments.length === 0) {
              // No enrollments yet
              return {
                ...user,
                enrollments: 0,
                completedCourses: 0,
                totalCourses: 0,
                averageProgress: 0,
                progress: []
              };
            }
            
            // Get all courses user is enrolled in
            const courses = await courseService.getEnrolledCourses(user.uid);
            
            // Get progress data for each course
            const progressPromises = courses.map(async (course) => {
              const courseId = course.firebaseId || course.id.toString();
              const progressRef = collection(db, "userProgress");
              const q = query(progressRef, where("userId", "==", user.uid), where("courseId", "==", courseId));
              const progressDocs = await getDocs(q);
              
              if (!progressDocs.empty) {
                const progressData = progressDocs.docs[0].data() as UserProgress;
                return {
                  courseId,
                  courseName: course.title,
                  progress: progressData.completionPercentage || 0
                };
              }
              
              return {
                courseId,
                courseName: course.title,
                progress: 0
              };
            });
            
            const progressData = await Promise.all(progressPromises);
            
            // Calculate completion statistics
            const completedCourses = progressData.filter(p => p.progress === 100).length;
            const averageProgress = progressData.length > 0 
              ? progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length 
              : 0;
            
            return {
              ...user,
              enrollments: enrollments.length,
              completedCourses,
              totalCourses: courses.length,
              averageProgress,
              progress: progressData
            };
          } catch (error) {
            console.error(`Error fetching progress for user ${user.email}:`, error);
            return user;
          }
        })
      );
      
      console.log("Fetched users with progress:", usersWithProgress.length);
      setUsers(usersWithProgress);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", selectedUser.uid);
      await updateDoc(userRef, {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      setIsRoleDialogOpen(false);
      console.log(`User ${selectedUser.email} role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", selectedUser.uid);
      await deleteDoc(userRef);
      
      // Update local state
      setUsers(users.filter(user => user.uid !== selectedUser.uid));
      
      setIsDeleteDialogOpen(false);
      console.log(`User ${selectedUser.email} deleted`);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'educator': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'learner': return "bg-green-100 text-green-800 hover:bg-green-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all registered users in the system</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.role === 'learner' ? (
                          <div className="flex flex-col gap-1">
                            {user.totalCourses ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <Progress value={user.averageProgress || 0} className="h-2 w-28" />
                                  <span className="text-sm text-gray-600">{Math.round(user.averageProgress || 0)}%</span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span>
                                    <BookOpen className="h-3 w-3 inline mr-1" />
                                    {user.enrollments} course{user.enrollments !== 1 ? 's' : ''}
                                  </span>
                                  <span>
                                    <BarChart3 className="h-3 w-3 inline mr-1" />
                                    {user.completedCourses}/{user.totalCourses} completed
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1 py-0 text-xs"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsProgressDialogOpen(true);
                                    }}
                                  >
                                    Details
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">No enrollments</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setIsRoleDialogOpen(true);
                            }}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Change Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <Select 
              value={newRole} 
              onValueChange={(value: 'learner' | 'educator' | 'admin') => setNewRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learner">Learner</SelectItem>
                <SelectItem value="educator">Educator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
              <p><span className="font-medium">Email:</span> {selectedUser?.email}</p>
              <p><span className="font-medium">Role:</span> {selectedUser?.role}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* User Progress Details Dialog */}
        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Learner Progress Details</DialogTitle>
              <DialogDescription>
                Detailed progress for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            
            {loadingProgress ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Enrolled Courses</p>
                    <p className="text-2xl font-bold">{selectedUser?.enrollments || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Completed Courses</p>
                    <p className="text-2xl font-bold">{selectedUser?.completedCourses || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Average Progress</p>
                    <p className="text-2xl font-bold">{Math.round(selectedUser?.averageProgress || 0)}%</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="w-48">Progress</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser?.progress && selectedUser.progress.length > 0 ? (
                        selectedUser.progress.map((course) => (
                          <TableRow key={course.courseId}>
                            <TableCell className="font-medium">{course.courseName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={course.progress} className="h-2 flex-1" />
                                <span className="text-sm text-gray-600 w-10">{Math.round(course.progress)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {course.progress === 100 ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  Completed
                                </Badge>
                              ) : course.progress > 0 ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                  In Progress
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                  Not Started
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                            No course progress found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
