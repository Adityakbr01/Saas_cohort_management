
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lesson } from "@/types/cohort"
import { CheckCircle, Clock, FileText, Play } from "lucide-react"
import { useEffect, useState } from "react"
import MediaPlayer from "../MediaPlayer"
import { formatDuration } from "@/utils/formatDuration"

interface LessonViewerProps {
  lesson: Lesson
  onComplete: () => void
}

export default function LessonViewer({ lesson, onComplete }: LessonViewerProps) {
  const [isCompleted, setIsCompleted] = useState(lesson?.isCompleted || false)

  console.log(lesson)

  const HandleComplate = () => {

    if (!isCompleted) {
      console.log("Working Handler")
      setIsCompleted(true);
      onComplete();
    }
  }

  useEffect(() => {
    setIsCompleted(lesson?.isCompleted)
  }, [lesson])

  console.log(isCompleted)

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">

{/* Todo You can also disable this but in my case i like it */}

          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              {lesson.title}
            </CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(Number(lesson.duration))}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {lesson.type === "video" && lesson.videoUrl ? (
          <div className="mb-6 flex justify-center items-center w-full">
            <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg border p-0 bg-black">
              <MediaPlayer url={lesson.videoUrl} onEnded={HandleComplate} />
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-center h-64 bg-muted rounded-lg">
            <span className="text-muted-foreground">No video available for this lesson.</span>
          </div>
        )}

        {/* Transcript Section */}
        {lesson.transcript && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Transcript</h4>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm">
              <p className="text-muted-foreground whitespace-pre-line">{lesson.transcript}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          {!isCompleted && (
            <Button
              onClick={HandleComplate}
            >
              Mark as Complete
            </Button>
          )}
          <Button variant="outline">Download Video</Button>
          <Button variant="outline">View Notes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
