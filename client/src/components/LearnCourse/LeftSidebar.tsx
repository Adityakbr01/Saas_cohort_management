import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ChapterNavigation from "./chapter-navigation";
import ProgressTracker from "./progress-tracker";
import DueDatesPanel from "./due-dates-panel";
import BookmarksPanel from "./bookmarks-panel";
import type { BookmarkedItem, CohortData, DueType, Lesson } from "@/types/cohort";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface LeftSidebarProps {
    leftSidebarOpen: boolean;
    cohortData: CohortData;
    selectedLesson: Lesson | null;
    handleLessonSelect: (lesson: Lesson) => void;
    toggleBookmark: (itemId: string, type: "lesson" | "chapter") => void;
    markChapterComplete: (chapterId: string) => void;
    getUpcomingDueDates: () => Array<{
        id: string;
        title: string;
        type: DueType;
        dueDate: string;
        chapterTitle: string;
    }>;
    getBookmarkedItems: () => BookmarkedItem[];
    toggleLeftSidebar: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
    leftSidebarOpen,
    cohortData,
    selectedLesson,
    handleLessonSelect,
    toggleBookmark,
    markChapterComplete,
    getUpcomingDueDates,
    getBookmarkedItems,
    toggleLeftSidebar,
}) => {
    return (
        <aside
            className={`fixed md:static inset-y-0 left-0 z-30 transition-all duration-300 overflow-y-auto border-r bg-card
        ${leftSidebarOpen ? "w-full sm:w-80" : "w-0 md:w-6"} md:border-r md:min-h-screen`}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleLeftSidebar}
                            className="absolute -right-3 top-1/2 z-40 transform -translate-y-1/2 bg-card border border-border rounded-full p-1 shadow-sm hover:bg-muted transition md:right-4 md:top-8"
                            aria-label={leftSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            {leftSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {leftSidebarOpen ? "Close left sidebar" : "Open left sidebar"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className={`${leftSidebarOpen ? "block" : "hidden md:block"} p-4 md:p-4`}>
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 gap-1">
                        <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
                        <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
                        <TabsTrigger value="due" className="text-xs sm:text-sm">Due</TabsTrigger>
                        <TabsTrigger value="bookmarks" className="text-xs sm:text-sm">Saved</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="mt-4">
                        {cohortData && (
                            <ChapterNavigation
                                chapters={cohortData.chapters}
                                selectedLesson={selectedLesson}
                                onLessonSelect={handleLessonSelect}
                                onToggleBookmark={toggleBookmark}
                                onMarkChapterComplete={markChapterComplete}
                            />
                        )}
                    </TabsContent>
                    <TabsContent value="progress" className="mt-4">
                        {cohortData && <ProgressTracker progress={cohortData.progress} />}
                    </TabsContent>
                    <TabsContent value="due" className="mt-4">
                        <DueDatesPanel dueDates={getUpcomingDueDates()} onLessonSelect={handleLessonSelect} />
                    </TabsContent>
                    <TabsContent value="bookmarks" className="mt-4">
                        <BookmarksPanel
                            bookmarks={getBookmarkedItems()}
                            onItemSelect={(item) => {
                                const lesson = cohortData.chapters
                                    .flatMap((chapter) => chapter.lessons)
                                    .find((lesson) => lesson.id === item.id);
                                if (lesson) {
                                    handleLessonSelect(lesson);
                                }
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </aside>
    );
};

export default LeftSidebar;