import React from "react";

import { Bookmark, BookmarkCheck, BookOpen, Calendar, CheckCircle, ChevronRight, Clock } from "lucide-react";



import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import LessonViewer from "./lesson-viewer";
import QuizComponent from "./quiz-component";
import AssignmentComponent from "./assignment-component";
import type { CohortData, Lesson, Question } from "@/types/cohort";
interface MainContentProps {
  cohortData: CohortData;
  selectedLesson: Lesson | null;
  markLessonComplete: (lessonId: string) => void;
  toggleBookmark: (itemId: string, type: "lesson" | "chapter") => void;
}

const MainContent: React.FC<MainContentProps> = ({
  cohortData,
  selectedLesson,
  markLessonComplete,
  toggleBookmark,
}) => {


  const isQuiz = (lesson: Lesson): lesson is Lesson & { questions: Question[] } => {
    return lesson.type === "quiz" && Array.isArray((lesson as any).questions)
  }
  return (
    <main className="flex-1 min-h-screen">
      {selectedLesson ? (
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span>
                {cohortData &&
                  cohortData.chapters.find((c) => c.lessons.some((l) => l.id === selectedLesson.id))?.title}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span>{selectedLesson.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedLesson.title}</h1>
                <p className="text-muted-foreground">{selectedLesson.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(selectedLesson.id, "lesson")}
                  className={`transition-colors ${selectedLesson.isBookmarked
                      ? "text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {selectedLesson.isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                {selectedLesson.isCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedLesson.duration}
                </Badge>
                {selectedLesson.dueDate && (
                  <Badge variant="outline" className="text-orange-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due {new Date(selectedLesson.dueDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {selectedLesson.type === "video" && (
              <LessonViewer lesson={selectedLesson} onComplete={() => markLessonComplete(selectedLesson.id)} />
            )}
            {selectedLesson.type === "reading" && (
              <Card>
                <CardHeader>
                  <CardTitle>Reading Material</CardTitle>
                  <CardDescription>{selectedLesson.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line">{selectedLesson.content}</div>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={() => markLessonComplete(selectedLesson.id)}
                      disabled={selectedLesson.isCompleted}
                    >
                      {selectedLesson.isCompleted ? "Completed" : "Mark as Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {isQuiz(selectedLesson) && (
              <QuizComponent quiz={selectedLesson} onComplete={() => markLessonComplete(selectedLesson.id)} />
            )}

            {selectedLesson.type === "assignment" && (
              <AssignmentComponent
                assignment={selectedLesson}
                onComplete={() => markLessonComplete(selectedLesson.id)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Welcome to Your Learning Portal</h2>
            <p className="text-muted-foreground">Select a lesson from the sidebar to get started</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainContent;