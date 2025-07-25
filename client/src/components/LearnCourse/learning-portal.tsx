import { useGetCohortDetailQuery, useMarkLessonCompleteMutation } from "@/store/features/api/enrolled/enrolled";
import type { BookmarkedItem, DueDate, Lesson } from "@/types/cohort";
import { BookOpen, Code, Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";
import RightSidebar from "./RightSidebar";
import { MainDashboardSkeleton } from "./enhanced-skeleton-loader";
import { NotificationBell } from "./enhanced-ui-components";

interface LearningPortalProps {
  cohortId: string;
}

const BOOKMARKS_KEY = "lms-bookmarks";

const LearningPortal: React.FC<LearningPortalProps> = ({ cohortId }) => {


  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  // All hooks at the top
  const { data: cohortData, isLoading, isError, error } = useGetCohortDetailQuery(cohortId);
  const [markLessonCompleteMutation] = useMarkLessonCompleteMutation();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);


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

  console.log(cohortData)

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
        students: cohortData.students,
        rating: cohortData.rating,
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

  if (isLoading) return <div className="w-full">
    <MainDashboardSkeleton />
  </div>;
  if (isError) {
    let errorMessage = "Failed to load cohort";
    if (typeof error === "string") errorMessage = error;
    else if (error && typeof error === "object" && "message" in error) errorMessage = (error as { message?: string }).message || errorMessage;
    return <div className="min-h-screen flex items-center justify-center text-red-500">{errorMessage}</div>;
  }
  if (!mergedCohortData) return null;

  const handleLessonSelect = (lesson: Lesson) => {
    if (!lesson.isLocked) setSelectedLesson(lesson);
    setSidebarOpen(false)

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
    <div className="flex flex-1 overflow-hidden relative">
      {/* <Header
      cohortData={mergedCohortData}
      leftSidebarOpen={leftSidebarOpen}
      setLeftSidebarOpen={setLeftSidebarOpen}
      rightSidebarOpen={rightSidebarOpen}
      toggleRightSidebar={toggleRightSidebar}
    /> */}

      {/* Desktop Left Panel */}
      {!isMobile && (
        <div className="w-80 border-r bg-card/30 flex md:flex">
          <LeftSidebar
            cohortData={mergedCohortData}
            selectedLesson={selectedLesson}
            handleLessonSelect={handleLessonSelect}
            toggleBookmark={toggleBookmark}
            markChapterComplete={markChapterComplete}
            getUpcomingDueDates={getUpcomingDueDates}
            getBookmarkedItems={getBookmarkedItems}
          />
        </div>
      )}

      {/* Mobile Left Panel */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <LeftSidebar
              cohortData={mergedCohortData}
              selectedLesson={selectedLesson}
              handleLessonSelect={handleLessonSelect}
              toggleBookmark={toggleBookmark}
              markChapterComplete={markChapterComplete}
              getUpcomingDueDates={getUpcomingDueDates}
              getBookmarkedItems={getBookmarkedItems}
            />
          </SheetContent>
        </Sheet>
      )}


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b bg-card/50">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">EduPlatform</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell count={12} onClick={() => { }} />
              <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Code className="h-4 w-4" />
                  
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Resources
                    </SheetTitle>
                  </SheetHeader>
                  <RightSidebar
                    selectedLesson={selectedLesson}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {/* Tablet Header - Show resources button */}
        {isTablet && (
          <div className="flex items-center justify-between p-4 border-b bg-card/50 lg:hidden">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">EduPlatform</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell count={12} onClick={() => { }} />
              <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    Resources
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Resources
                    </SheetTitle>
                  </SheetHeader>
                  <RightSidebar
                    selectedLesson={selectedLesson}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {/* Enhanced Video Player */}

        {/* Enhanced Lesson Info & Controls */}
        <div className="">
          <MainContent
            cohortId={cohortData?.id}
            cohortData={mergedCohortData}
            selectedLesson={selectedLesson}
            onMarkLessonComplete={markLessonComplete}
            toggleBookmark={toggleBookmark}
          />


        </div>
      </div>

      {/* Desktop Right Panel - Fixed visibility for md and lg screens */}
      {!isMobile && !isTablet && (
        <div className="w-96 border-l bg-card/30 flex">
          <RightSidebar
            selectedLesson={selectedLesson}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      )}
    </div>




  );
};

export default LearningPortal;