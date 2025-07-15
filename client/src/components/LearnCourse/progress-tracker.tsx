"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, BookOpen, FileText, Play, Award } from "lucide-react"
import type { ProgressData } from "@/types/cohort"


interface ProgressTrackerProps {
  progress: ProgressData
  
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />
      case "reading":
        return <BookOpen className="h-4 w-4 text-orange-500" />
      case "quiz":
        return <FileText className="h-4 w-4 text-green-500" />
      case "assignment":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Videos"
      case "reading":
        return "Readings"
      case "quiz":
        return "Quizzes"
      case "assignment":
        return "Assignments"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Progress</h3>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{progress.overall}%</div>
            <div className="text-xs text-muted-foreground">
              {progress.completedLessons} of {progress.totalLessons} lessons completed
            </div>
          </div>
          <Progress value={progress.overall} className="h-3" />
        </CardContent>
      </Card>

      {/* Progress by Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progress by Content Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(progress.byType).map(([type, value]) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)}</span>
                </div>
                <span className="font-medium">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-lg font-bold">{progress.timeSpent}</div>
            <div className="text-xs text-muted-foreground">Time Spent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-lg font-bold">{progress.streak} days</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {progress.achievements.map((achievement, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {achievement}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
