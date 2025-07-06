// Tools Component

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, BookOpen, Calendar, Download, GraduationCap, MessageSquare } from "lucide-react";

interface ToolsProps {
  onCurriculumClick: () => void;
  onCommunicationClick: () => void;
}

function Tools({ onCurriculumClick, onCommunicationClick }: ToolsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Curriculum Builder
            </CardTitle>
            <CardDescription>Create and organize course content with drag-and-drop</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onCurriculumClick}>
              Open Builder
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication Center
            </CardTitle>
            <CardDescription>Manage messages, announcements, and discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onCommunicationClick}>
              Open Center
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Reports & Export
            </CardTitle>
            <CardDescription>Generate reports and export student data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Generate Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Manager
            </CardTitle>
            <CardDescription>Manage sessions, office hours, and events</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Schedule
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Assessment Tools
            </CardTitle>
            <CardDescription>Create quizzes, assignments, and evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Create Assessment
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Student Support
            </CardTitle>
            <CardDescription>Track at-risk students and intervention strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Support Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default Tools