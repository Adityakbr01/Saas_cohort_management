import React from "react";

import { BookOpen } from "lucide-react";



import type { CohortData, Lesson, Question } from "@/types/cohort";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import AssignmentComponent from "./assignment-component";
import LessonViewer from "./lesson-viewer";
import QuizComponent from "./quiz-component";

interface MainContentProps {
  cohortData: CohortData;
  selectedLesson: Lesson | null;
  onMarkLessonComplete: (lessonId: string) => void; // renamed
  toggleBookmark: (itemId: string, type: "lesson" | "chapter") => void;
}

const MainContent: React.FC<MainContentProps> = ({
  selectedLesson,
  onMarkLessonComplete,
  toggleBookmark,
}) => {


  const isQuiz = (lesson: Lesson): lesson is Lesson & { questions: Question[] } => {
    return lesson.type === "quiz" && Array.isArray((lesson as { questions?: unknown }).questions);
  }

  return (
    <main className="flex-1 min-h-screen scrollbar-hidden ">
      {selectedLesson ? (
        <div className="">
          <div className="space-y-6">
            {selectedLesson.type === "video" && (
              <LessonViewer lesson={selectedLesson} onComplete={() => onMarkLessonComplete(selectedLesson.id)} toggleBookmark={toggleBookmark} selectedLesson={selectedLesson} />
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
                      onClick={() => onMarkLessonComplete(selectedLesson.id)}
                      disabled={selectedLesson.isCompleted}
                    >
                      {selectedLesson.isCompleted ? "Completed" : "Mark as Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {isQuiz(selectedLesson) && (
              <QuizComponent quiz={selectedLesson} onComplete={() => onMarkLessonComplete(selectedLesson.id)} />
            )}

            {selectedLesson.type === "assignment" && (
              <AssignmentComponent
                assignment={selectedLesson}
                onComplete={() => onMarkLessonComplete(selectedLesson.id)}
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