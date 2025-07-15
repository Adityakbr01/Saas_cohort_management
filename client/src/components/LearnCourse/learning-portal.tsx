import React, { useEffect, useState } from "react";

import { mockCohort } from "@/lib/mock-cohort-data";
import type { BookmarkedItem, BookmarkedType, CohortData, DueDate, Lesson } from "@/types/cohort";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";
import RightSidebar from "./RightSidebar";



interface LearningPortalProps {
  cohortId: string;
}

const LearningPortal: React.FC<LearningPortalProps> = ({ cohortId }) => {


  console.log(cohortId)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [cohortData, setCohortData] = useState<CohortData>(mockCohort);

  useEffect(() => {
    const savedLeftSidebarState = localStorage.getItem("lms-left-sidebar-open");
    const savedRightSidebarState = localStorage.getItem("lms-right-sidebar-open");

    if (savedLeftSidebarState !== null) {
      setLeftSidebarOpen(JSON.parse(savedLeftSidebarState));
    }

    if (savedRightSidebarState !== null) {
      setRightSidebarOpen(JSON.parse(savedRightSidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lms-left-sidebar-open", JSON.stringify(leftSidebarOpen));
  }, [leftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("lms-right-sidebar-open", JSON.stringify(rightSidebarOpen));
  }, [rightSidebarOpen]);

  useEffect(() => {
    if (cohortData) {
      const firstChapter = cohortData.chapters[0];
      if (firstChapter && firstChapter.lessons.length > 0) {
        setSelectedLesson(firstChapter.lessons[0]);
      }
    }
  }, [cohortData]);

  const handleLessonSelect = (lesson: Lesson) => {
    if (!lesson.isLocked) setSelectedLesson(lesson);
  };

  const markLessonComplete = (lessonId: string) => {
    setCohortData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
        ),
      })),
    }));
  };

  const markChapterComplete = (chapterId: string) => {
    setCohortData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, isCompleted: true, progress: 100 } : chapter
      ),
    }));
  };

  const toggleBookmark = (itemId: string, type: "lesson" | "chapter") => {
    setCohortData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => {
        if (type === "chapter" && chapter.id === itemId) {
          return { ...chapter, isBookmarked: !chapter.isBookmarked };
        }
        return {
          ...chapter,
          lessons: chapter.lessons.map((lesson) =>
            lesson.id === itemId ? { ...lesson, isBookmarked: !lesson.isBookmarked } : lesson
          ),
        };
      }),
    }));
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const getUpcomingDueDates = (): DueDate[] => {
    const dueDates: DueDate[] = [];

    cohortData.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        if (lesson.dueDate && !lesson.isCompleted) {
          // Narrow down lesson.type to correct literal type
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

    return dueDates.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  };

  const getBookmarkedItems = (): BookmarkedItem[] => {
    const bookmarked: BookmarkedItem[] = [];

    cohortData.chapters.forEach((chapter) => {
      if (chapter.isBookmarked) {
        bookmarked.push({
          id: chapter.id,
          title: chapter.title,
          type: "chapter", // ✅ Safe
          description: chapter.description,
        });
      }

      chapter.lessons.forEach((lesson) => {
        if (lesson.isBookmarked) {
          const allowedTypes: BookmarkedType[] = ["video", "reading", "quiz", "assignment"];
          if (allowedTypes.includes(lesson.type as BookmarkedType)) {
            bookmarked.push({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type as BookmarkedType, // ✅ Cast string to safe union
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
    <div className="min-h-screen bg-background">
      <Header
        cohortData={cohortData}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        toggleRightSidebar={toggleRightSidebar}
      />
      <div className="flex">
        <LeftSidebar
          leftSidebarOpen={leftSidebarOpen}
          cohortData={cohortData}
          selectedLesson={selectedLesson}
          handleLessonSelect={handleLessonSelect}
          toggleBookmark={toggleBookmark}
          markChapterComplete={markChapterComplete}
          getUpcomingDueDates={getUpcomingDueDates}
          getBookmarkedItems={getBookmarkedItems}
        />
        <MainContent
          cohortData={cohortData}
          selectedLesson={selectedLesson}
          markLessonComplete={markLessonComplete}
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