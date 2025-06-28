import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { TabsContent } from "@/components/ui/tabs"

interface UserData {
  enrolledCourses: {
    id: string
    title: string
    instructor: string
    progress: number
    thumbnail: string
    status: "In Progress" | "Completed"
    lastAccessed: string
  }[]
}

export function CoursesTab({ userData }: { userData: UserData }) {
  return (
    <TabsContent value="courses" className="mt-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
          {userData.enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {userData.enrolledCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img src={course.thumbnail} alt={course.title} className="h-24 w-24 rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold mb-1">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">by {course.instructor}</p>
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
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">Last accessed {course.lastAccessed}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" asChild>
                            <Link to={`/courses/${course.id}`}>
                              {course.status === "Completed" ? "Review" : "Continue"}
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            View Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h4 className="font-semibold mb-2">No Courses Enrolled</h4>
                <p className="text-muted-foreground mb-4">
                  Explore our courses to start your learning journey!
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  )
}