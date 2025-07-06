import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarHeart, Eye, MessageSquare } from "lucide-react";
import type { upcomingEvents } from "./MentorDashboard";

// UpcomingEvents Component
interface UpcomingEventsProps {
  events: typeof upcomingEvents;
}

function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarHeart className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Your scheduled sessions and meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex-shrink-0">
                {event.type === "live_session" && <BookOpen className="h-5 w-5 text-blue-500" />}
                {event.type==="review_session" && <Eye className="h-5 w-5 text-green-500" />}
                {event.type === "office_hours" && <MessageSquare className="h-5 w-5 text-purple-500" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.cohort}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                {event.attendees > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{event.attendees} attendees expected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default UpcomingEvents