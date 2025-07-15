import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  Award,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Chapter {
  id: string
  title: string
  description: string
  progress: number
  isCompleted: boolean
  isBookmarked: boolean
  estimatedTime: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: "video" | "quiz" | "assignment" | "reading"
  duration: string
  isCompleted: boolean
  isLocked: boolean
  isBookmarked: boolean
  description: string
  score?: number
  dueDate?: string
}

interface ChapterNavigationProps {
  chapters: Chapter[];
  selectedLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
  onToggleBookmark: (id: string, type: "chapter" | "lesson") => void;
  onMarkChapterComplete: (chapterId: string) => void;
}


export default function ChapterNavigation({
  chapters,
  selectedLesson,
  onLessonSelect,
  onToggleBookmark,
  onMarkChapterComplete,
}: ChapterNavigationProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(["chapter_1", "chapter_2"]))

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.isLocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />
    }

    switch (lesson.type) {
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

  const getLessonStatusIcon = (lesson: Lesson) => {
    if (lesson.isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return null
  }

  const isChapterFullyCompleted = (chapter: Chapter) => {
    return chapter.lessons.every((lesson) => lesson.isCompleted)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Course Content</h3>

      {chapters.map((chapter) => {
        const isExpanded = expandedChapters.has(chapter.id)
        const completedLessons = chapter.lessons.filter((lesson) => lesson.isCompleted).length
        const fullyCompleted = isChapterFullyCompleted(chapter)

        return (
          <div key={chapter.id} className="border rounded-lg overflow-hidden">
            {/* Chapter Header */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex-1 p-4 h-auto justify-start hover:bg-muted/50"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{chapter.title}</h4>
                        {chapter.isCompleted && <Award className="h-4 w-4 text-yellow-500" />}
                        {chapter.isBookmarked && <BookmarkCheck className="h-4 w-4 text-amber-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {completedLessons}/{chapter.lessons.length} lessons
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{chapter.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{chapter.progress}%</div>
                    <Progress value={chapter.progress} className="w-16 h-2" />
                  </div>
                </div>
              </Button>

              {/* Chapter Actions */}
              <div className="flex items-center gap-1 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleBookmark(chapter.id, "chapter")}
                  className={`transition-colors ${
                    chapter.isBookmarked
                      ? "text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {chapter.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
                {fullyCompleted && !chapter.isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkChapterComplete(chapter.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Chapter Content */}
            {isExpanded && (
              <div className="border-t bg-muted/20">
                <div className="p-2 space-y-1">
                  {chapter.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center">
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex-1 p-3 h-auto justify-start hover:bg-background",
                          selectedLesson?.id === lesson.id && "bg-background border",
                          lesson.isLocked && "opacity-60 cursor-not-allowed",
                        )}
                        onClick={() => onLessonSelect(lesson)}
                        disabled={lesson.isLocked}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson)}
                              <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{lesson.title}</p>
                                {getLessonStatusIcon(lesson)}
                                {lesson.isBookmarked && <BookmarkCheck className="h-3 w-3 text-amber-600" />}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </span>
                              </div>
                              {lesson.score && (
                                <div className="text-xs text-green-600 mt-1">Score: {lesson.score}%</div>
                              )}
                              {lesson.dueDate && !lesson.isCompleted && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Due: {new Date(lesson.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>

                      {/* Lesson Bookmark */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleBookmark(lesson.id, "lesson")}
                        className={`mr-2 transition-colors ${
                          lesson.isBookmarked
                            ? "text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {lesson.isBookmarked ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
