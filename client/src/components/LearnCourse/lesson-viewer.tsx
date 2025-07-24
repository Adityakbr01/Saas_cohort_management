
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/types/cohort"
import { formatDuration } from "@/utils/formatDuration"
import { Bookmark, CheckCircle2, Clock4, Download, MessageSquare, MoreHorizontal, Settings2, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import MediaPlayer from "../MediaPlayer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface LessonViewerProps {
  lesson: Lesson
  onComplete: () => void
  toggleBookmark: (itemId: string, type: "lesson" | "chapter") => void
  selectedLesson: Lesson
}

export default function LessonViewer({ lesson, onComplete, toggleBookmark, selectedLesson }: LessonViewerProps) {
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
    <Card className="shadow-none border-none border-b w-full ">
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
  {/* Lesson Info */}
<div className="space-y-3 mb-4">
  <h2 className="text-2xl font-semibold">{selectedLesson.title}</h2>

  <p className="text-base text-muted-foreground leading-relaxed">
    {selectedLesson.description || selectedLesson.shortDescription}
  </p>

  <div className="text-sm text-gray-500 flex items-center gap-1.5">
    <Clock4 className="w-4 h-4" />
    <span>{formatDuration(Number(selectedLesson.duration))}</span>
  </div>
</div>

        <TooltipProvider>
          <div className={cn("flex flex-wrap gap-2")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onComplete}
                  className={cn(
                    "flex-1 md:flex-none transition-all duration-200",
                    isCompleted ? "bg-green-600 cursor-not-allowed hover:bg-green-700 text-white shadow-lg" : "bg-primary hover:bg-primary/90",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCompleted ? "Mark as incomplete" : "Mark as complete"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => toggleBookmark(selectedLesson.id, "lesson")}
                  className={cn(
                    "flex-1 md:flex-none bg-transparent transition-all duration-200",
                    selectedLesson.isBookmarked && "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                  )}
                >
                  <Bookmark className={cn("h-4 w-4 mr-2", selectedLesson.isBookmarked && "fill-current")} />
                  {selectedLesson.isBookmarked ? "Saved" : "Save"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{selectedLesson.isBookmarked ? "Remove bookmark" : "Bookmark lesson"}</p>
              </TooltipContent>
            </Tooltip>



            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => { }} className="flex-1 md:flex-none bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download lesson materials</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discuss
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => { }} className="hidden md:flex bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this lesson</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

      </CardContent>
    </Card>
  )
}
