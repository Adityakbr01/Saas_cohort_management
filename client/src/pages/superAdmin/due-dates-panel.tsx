"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertTriangle, Play, FileText, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface DueDate {
  id: string
  title: string
  type: "video" | "quiz" | "assignment" | "reading"
  dueDate: string
  chapterTitle: string
}

interface DueDatesPanelProps {
  dueDates: DueDate[]
  onLessonSelect: (lesson: any) => void
}

export default function DueDatesPanel({ dueDates, onLessonSelect }: DueDatesPanelProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />
      case "quiz":
        return <FileText className="h-4 w-4 text-green-500" />
      case "assignment":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      case "reading":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getUrgencyLevel = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 0) return "overdue"
    if (diffInHours < 24) return "urgent"
    if (diffInHours < 72) return "soon"
    return "normal"
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "soon":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 0) {
      return `Overdue by ${Math.abs(Math.floor(diffInHours / 24))} days`
    } else if (diffInHours < 24) {
      return `Due in ${Math.floor(diffInHours)} hours`
    } else if (diffInHours < 72) {
      return `Due in ${Math.floor(diffInHours / 24)} days`
    } else {
      return `Due ${date.toLocaleDateString()}`
    }
  }

  const sortedDueDates = dueDates.sort((a, b) => {
    const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, normal: 3 }
    const aUrgency = getUrgencyLevel(a.dueDate)
    const bUrgency = getUrgencyLevel(b.dueDate)

    if (urgencyOrder[aUrgency as keyof typeof urgencyOrder] !== urgencyOrder[bUrgency as keyof typeof urgencyOrder]) {
      return urgencyOrder[aUrgency as keyof typeof urgencyOrder] - urgencyOrder[bUrgency as keyof typeof urgencyOrder]
    }

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Upcoming Due Dates</h3>
      </div>

      {sortedDueDates.length > 0 ? (
        <div className="space-y-2">
          {sortedDueDates.map((item) => {
            const urgency = getUrgencyLevel(item.dueDate)
            return (
              <Card
                key={item.id}
                className={cn("cursor-pointer transition-all hover:shadow-md", getUrgencyColor(urgency))}
                onClick={() => onLessonSelect({ id: item.id, title: item.title, type: item.type })}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        {urgency === "overdue" && <AlertTriangle className="h-3 w-3 text-red-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.chapterTitle}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDueDate(item.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No upcoming due dates</p>
            <p className="text-muted-foreground text-xs mt-1">You're all caught up! Great work.</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {sortedDueDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Due Date Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-semibold text-red-800">
                  {sortedDueDates.filter((item) => getUrgencyLevel(item.dueDate) === "overdue").length}
                </div>
                <div className="text-red-600">Overdue</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-semibold text-orange-800">
                  {sortedDueDates.filter((item) => getUrgencyLevel(item.dueDate) === "urgent").length}
                </div>
                <div className="text-orange-600">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
