import { useGetCohortDetailQuery, useMarkLessonCompleteMutation } from "@/store/features/api/enrolled/enrolled";
import type { BookmarkedItem, DueDate, Lesson } from "@/types/cohort";
import React, { useEffect, useState } from "react";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";
import RightSidebar from "./RightSidebar";

interface LearningPortalProps {
  cohortId: string;
}

function CohortSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-6 bg-muted rounded w-1/3 mx-auto" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  );
}

const BOOKMARKS_KEY = "lms-bookmarks";

const LearningPortal: React.FC<LearningPortalProps> = ({ cohortId }) => {
  // All hooks at the top
  const { data: cohortData, isLoading, isError, error } = useGetCohortDetailQuery(cohortId);
  const [markLessonCompleteMutation] = useMarkLessonCompleteMutation();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [bookmarks, setBookmarks] = useState<{ [id: string]: { type: "lesson" | "chapter" } }>({});

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Merge bookmarks into cohortData
  const mergedCohortData = React.useMemo(() => {
    if (!cohortData) return cohortData;
    return {
      ...cohortData,
      chapters: cohortData.chapters.map((chapter) => ({
        ...chapter,
        isBookmarked: !!bookmarks[chapter.id],
        lessons: chapter.lessons.map((lesson) => ({
          ...lesson,
          isBookmarked: !!bookmarks[lesson.id],
        })),
      })),
    };
  }, [cohortData, bookmarks]);

  useEffect(() => {
    if (mergedCohortData) {
      const firstChapter = mergedCohortData.chapters[0];
      if (firstChapter && firstChapter.lessons.length > 0) {
        setSelectedLesson(firstChapter.lessons[0]);
      }
    }
  }, [mergedCohortData]);

  if (isLoading) return <CohortSkeleton />;
  if (isError) {
    let errorMessage = "Failed to load cohort";
    if (typeof error === "string") errorMessage = error;
    else if (error && typeof error === "object" && "message" in error) errorMessage = (error as { message?: string }).message || errorMessage;
    return <div className="min-h-screen flex items-center justify-center text-red-500">{errorMessage}</div>;
  }
  if (!mergedCohortData) return null;

  const handleLessonSelect = (lesson: Lesson) => {
    if (!lesson.isLocked) setSelectedLesson(lesson);
  };

  const markLessonComplete = (lessonId: string, chapterId?: string, timeSpent?: number) => {
    console.log(cohortId, chapterId, lessonId, timeSpent)
    markLessonCompleteMutation({ cohortId, chapterId, lessonId, timeSpent });
    console.log("Perent Call")
  };

  const markChapterComplete = (chapterId: string) => {
    console.log(chapterId)
    // This function is no longer needed as cohortData is managed by RTK Query
  };

  // Toggle bookmark for lesson or chapter
  const toggleBookmark = (itemId: string, type: "lesson" | "chapter") => {
    setBookmarks((prev) => {
      const updated = { ...prev };
      if (updated[itemId]) {
        delete updated[itemId];
      } else {
        updated[itemId] = { type };
      }
      return updated;
    });
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const getUpcomingDueDates = (): DueDate[] => {
    const dueDates: DueDate[] = [];
    mergedCohortData.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        if (lesson.dueDate && !lesson.isCompleted) {
          if (
            lesson.type === "video" ||
            lesson.type === "reading" ||
            lesson.type === "quiz" ||
            lesson.type === "assignment"
          ) {
            dueDates.push({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              dueDate: lesson.dueDate,
              chapterTitle: chapter.title,
            });
          }
        }
      });
    });
    return dueDates.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getBookmarkedItems = (): BookmarkedItem[] => {
    const bookmarked: BookmarkedItem[] = [];
    mergedCohortData.chapters.forEach((chapter) => {
      if (chapter.isBookmarked) {
        bookmarked.push({
          id: chapter.id,
          title: chapter.title,
          type: "chapter",
          description: chapter.description,
        });
      }
      chapter.lessons.forEach((lesson) => {
        if (lesson.isBookmarked) {
          const allowedTypes = ["video", "reading", "quiz", "assignment"];
          if (allowedTypes.includes(lesson.type)) {
            bookmarked.push({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type as "video" | "reading" | "quiz" | "assignment",
              description: lesson.description,
              chapterTitle: chapter.title,
            });
          }
        }
      });
    });
    return bookmarked;
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <Header
        cohortData={mergedCohortData}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        toggleRightSidebar={toggleRightSidebar}
      />
      <div className="flex">
        <LeftSidebar
          leftSidebarOpen={leftSidebarOpen}
          cohortData={mergedCohortData}
          selectedLesson={selectedLesson}
          handleLessonSelect={handleLessonSelect}
          toggleBookmark={toggleBookmark}
          markChapterComplete={markChapterComplete}
          getUpcomingDueDates={getUpcomingDueDates}
          getBookmarkedItems={getBookmarkedItems}
        />
        <MainContent
          cohortData={mergedCohortData}
          selectedLesson={selectedLesson}
          onMarkLessonComplete={markLessonComplete}
          toggleBookmark={toggleBookmark}
        />
        <RightSidebar
          rightSidebarOpen={rightSidebarOpen}
          toggleRightSidebar={toggleRightSidebar}
          selectedLesson={selectedLesson}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

export default LearningPortal;