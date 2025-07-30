import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export interface UserData {
  enrolledCourses: {
    id: string;
    title: string;
    thumbnail: string;
    progress: number;
    status: "In Progress" | "Completed";
    lastAccessed: string;
    timeSpent: string;
    streakDays: number;
    xp: number;
    byType: Record<string, number>;
    timeSpentSeconds: number;
  }[];
  bio: string;
  location?: string;
  avatar?: string;
  profileImageUrl?: string;
  createdAt: string;
  courseProgress?: any[];
  certificates?: { id: string; title: string; instructor: string; issueDate: string }[];
  stats?: {
    coursesCompleted: number;
    coursesInProgress: number;
    totalHoursLearned: number;
    certificatesEarned: number;
  };
  role: string;
  xp: number;
  streakDays: number;
  name: string;
  email: string;
}

export function CoursesTab({ userData }: { userData: UserData }) {
  return (
    <TabsContent value="courses" className="mt-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enrolled Courses</h3>
          <div className="text-sm text-gray-600">
            Completed: {userData?.stats?.coursesCompleted || 0} | In Progress:{" "}
            {userData?.stats?.coursesInProgress || 0}
          </div>
        </div>
        {userData.enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {userData.enrolledCourses.map((course) => {
              const lastAccessed = formatDistanceToNow(new Date(course.lastAccessed), { addSuffix: true });
              return (
                <Card key={course.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold mb-1">{course.title}</h4>
                            {/* Todo */}
                            {/* <p className="text-sm text-gray-600">Time Spent: {course.timeSpent}</p> */}
                            <p className="text-sm text-gray-400">Streak: {course.streakDays} days</p>
                            <p className="text-sm text-gray-400">XP: {course.xp}</p>
                          </div>
                          <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2 transition-all duration-700" />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Video: {course.byType.video || 0}%</span>
                            <span>Quiz: {course.byType.quiz || 0}%</span>
                            <span>Assignment: {course.byType.assignment || 0}%</span>
                          </div>
                          <p className="text-xs text-gray-400">Last accessed: {lastAccessed}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" asChild className="cursor-pointer">
                            <Link to={course.status === "Completed" ? `/courses/${course.id}` : `/learn/${course.id} `}>
                              {course.status === "Completed" ? "Review" : "Continue"}
                            </Link>
                          </Button>
                          <Button size="sm" variant={"destructive"} className="cursor-pointer">
                            <Link to={`/update/${course.id}`}>
                              Updates
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={course.status !== "Completed"}
                            onClick={() => alert("Certificate feature coming soon!")}
                            className="cursor-pointer">
                            View Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h4 className="font-semibold mb-2">No Courses Enrolled</h4>
              <p className="text-gray-600 mb-4">Explore our courses to start your learning journey!</p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}
