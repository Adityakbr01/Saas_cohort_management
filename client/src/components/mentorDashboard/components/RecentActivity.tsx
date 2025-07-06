import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

// RecentActivity Component
const recentActivity = [
  {
    id: "1",
    type: "assignment_submitted",
    student: "John Doe",
    cohort: "Data Science Bootcamp",
    time: "2 hours ago",
    description: "Submitted Python Fundamentals Assignment",
  },
  {
    id: "2",
    type: "question_asked",
    student: "Jane Smith",
    cohort: "ML Advanced",
    time: "4 hours ago",
    description: "Asked question about neural networks",
  },
  {
    id: "3",
    type: "milestone_reached",
    student: "Bob Wilson",
    cohort: "Data Science Bootcamp",
    time: "1 day ago",
    description: "Completed Module 3: Statistics",
  },
];

interface RecentActivityProps {
  activities: typeof recentActivity;
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates from your students and cohorts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="flex-shrink-0 mt-1">
                {activity.type === "assignment_submitted" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                {activity.type === "question_asked" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                {activity.type === "milestone_reached" && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">{activity.cohort}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivity