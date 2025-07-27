import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { BookmarkedItem, CohortData, DueType, Lesson } from "@/types/cohort";
import { BarChart3, Bookmark, BookMarked, BookOpen, CalendarDays, CheckCircle, Flame, GraduationCap, Star, Users } from "lucide-react";
import React, { useState } from "react";
// import { NotificationBell } from "../LearnCourse2/enhanced-ui-components";
import BookmarksPanel from "./bookmarks-panel";
import ChapterNavigation from "./chapter-navigation";
import DueDatesPanel from "./due-dates-panel";
import ProgressTracker from "./progress-tracker";


interface LeftSidebarProps {
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
  cohortData,
  selectedLesson,
  handleLessonSelect,
  toggleBookmark,
  markChapterComplete,
  getUpcomingDueDates,
  getBookmarkedItems,
}) => {
  const [activeSection, setActiveSection] = useState<"content" | "progress" | "due" | "bookmarks">("content");
  const [sectionLoading, setSectionLoading] = useState(false);

  const progress = cohortData.progress;

  function calculatePercentage(completed: number, total: number) {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  const userProgress = {
    lessonProgress: {
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      percentage: calculatePercentage(progress.completedLessons, progress.totalLessons),
    },
    chapterProgress: {
      completedChapters: cohortData.chapters.length > 0
        ? cohortData.chapters.filter((ch) => ch.isCompleted).length
        : 0,
      totalChapters: cohortData.chapters.length,
    },
    courseProgress: {
      percentage: progress.overall * 100, // Adjust for 0-1 scale to percentage
    },
    currentStreak: progress.streak,
  };

  const handleSectionChange = (section: typeof activeSection) => {
    if (section !== activeSection) {
      setSectionLoading(true);
      setActiveSection(section);
      setTimeout(() => setSectionLoading(false), 600);
    }
  };

  console.log(cohortData.ratingStats)

  return (
    <div className="flex flex-col h-screen w-full sm:w-80 md:min-w-80 bg-card border-r md:min-h-screen ">
      {/* Left sidebar Header */}
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-[180px]" title={cohortData.title}>
                {cohortData.title}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate" title={cohortData.language}>
              ({cohortData.language})
            </span>
          </div>
          {/* <NotificationBell count={12} onClick={() => {}} /> */}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2 break-words" title={cohortData.description}>
          {cohortData.description}
        </p>

        <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{cohortData?.ratingStats?.averageRating || 0} stars({cohortData?.ratingStats?.totalRatings || 0})</span>
          </div>
          <span className="">•</span>
          <span className="flex items-center gap-1 sm:gap-2">
            <Users width={12} height={12} color="Green" /> {cohortData?.students?.toLocaleString() || 0} students enrolled
          </span>
        </div>
      </div>

      {/* Enhanced Progress Summary */}
      <div className="p-3 sm:p-4 border-b space-y-2 sm:space-y-3 bg-gradient-to-br from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-blue-100 rounded-full">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg">{userProgress.lessonProgress.percentage}%</span>
              <span className="text-xs sm:text-sm text-muted-foreground ml-1">Complete</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            {userProgress.lessonProgress.completedLessons}/{userProgress.lessonProgress.totalLessons} Lessons
          </Badge>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Course Progress</span>
            <span className="font-medium">{userProgress.courseProgress.percentage}% Complete</span>
          </div>
          <Progress value={userProgress.courseProgress.percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          <div className="text-center p-1 sm:p-2 rounded-lg
    bg-green-100 dark:bg-green-900/40
    border border-green-200 dark:border-green-800
    hover:bg-green-200 dark:hover:bg-green-900/60
    transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 dark:text-green-300" />
              <span className="font-bold text-base sm:text-lg">{userProgress.chapterProgress.completedChapters}</span>
            </div>
            <div className="text-xs text-muted-foreground">Chapters</div>
          </div>
          <div className="text-center p-1 sm:p-2 rounded-lg
    bg-blue-100 dark:bg-blue-900/40
    border border-blue-200 dark:border-blue-800
    hover:bg-blue-200 dark:hover:bg-blue-900/60
    transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookMarked className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 dark:text-blue-300" />
              <span className="font-bold text-base sm:text-lg">{userProgress.lessonProgress.completedLessons}</span>
            </div>
            <div className="text-xs text-muted-foreground">Lessons</div>
          </div>
          <div className="text-center p-1 sm:p-2 rounded-lg
    bg-orange-100 dark:bg-orange-900/40
    border border-orange-200 dark:border-orange-800
    hover:bg-orange-200 dark:hover:bg-orange-900/60
    transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-3 sm:h-4 w-3 sm:w-4 text-orange-600 dark:text-orange-300" />
              <span className="font-bold text-base sm:text-lg">{userProgress.currentStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b bg-muted/20 text-xs">
        {[
          { key: "content", label: "Content", icon: BookOpen },
          { key: "progress", label: "Progress", icon: BarChart3 },
          { key: "due", label: "Due", icon: CalendarDays },
          { key: "bookmarks", label: "Saved", icon: Bookmark },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleSectionChange(key as any)}
            disabled={sectionLoading}
            className={cn(
              "flex-1 min-w-[60px] p-2 sm:p-3 font-medium border-b-2 transition-all duration-200 disabled:opacity-50 hover:bg-muted/30",
              activeSection === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <Icon className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="truncate">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto overflow-x-hidden max-w-full break-words min-h-[200px]">
        {sectionLoading ? (
          <div className="p-4 space-y-3">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            {activeSection === "content" && (
              <ChapterNavigation
                chapters={cohortData.chapters}
                selectedLesson={selectedLesson}
                onLessonSelect={handleLessonSelect}
                onToggleBookmark={toggleBookmark}
                onMarkChapterComplete={markChapterComplete}
              />
            )}
            {activeSection === "progress" && (
              <ProgressTracker progress={cohortData.progress} chapters={cohortData.chapters} />
            )}
            {activeSection === "due" && (
              <DueDatesPanel dueDates={getUpcomingDueDates()} onLessonSelect={handleLessonSelect} />
            )}
            {activeSection === "bookmarks" && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;