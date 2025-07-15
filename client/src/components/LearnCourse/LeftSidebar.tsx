import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ChapterNavigation from "./chapter-navigation";
import ProgressTracker from "./progress-tracker";
import DueDatesPanel from "./due-dates-panel";
import BookmarksPanel from "./bookmarks-panel";
import type { BookmarkedItem, CohortData, DueType, Lesson } from "@/types/cohort";


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
}) => {
    return (
        <aside
            className={`${leftSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden border-r bg-card lg:w-80`}
        >
            <div className="p-4">
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="due">Due</TabsTrigger>
                        <TabsTrigger value="bookmarks">Saved</TabsTrigger>
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