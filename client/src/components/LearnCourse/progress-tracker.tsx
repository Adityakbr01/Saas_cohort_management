import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProgressData } from "@/types/cohort";
import Logger from "@/utils/logger";
import { motion } from "framer-motion";
import { Award, BookOpen, Calendar, Clock, FileText, Play, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface ProgressTrackerProps {
  progress: ProgressData;
  chapters?: any[]; // Optional, to derive chapter progress
}

export default function ProgressTracker({ progress, chapters = [] }: ProgressTrackerProps) {
  // Calculate today and longest streak
  const [longestStreak, setLongestStreak] = useState<string[]>([]);
  useEffect(() => {
    if (!Array.isArray(progress.streakDays) || progress.streakDays.length === 0) return;
    const days = Array.from(new Set(progress.streakDays.map((d) => new Date(d).toISOString().slice(0, 10)))).sort();
    let maxStreak: string[] = [];
    let currentStreak: string[] = [];
    for (let i = 0; i < days.length; i++) {
      if (i === 0 || new Date(days[i]).getTime() - new Date(days[i - 1]).getTime() === 86400000) {
        currentStreak.push(days[i]);
      } else {
        if (currentStreak.length > maxStreak.length) maxStreak = [...currentStreak];
        currentStreak = [days[i]];
      }
    }
    if (currentStreak.length > maxStreak.length) maxStreak = [...currentStreak];
    setLongestStreak(maxStreak);
  }, [progress.streakDays]);

  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    let triggered = false;
    if (progress.streakDays && progress.streakDays.length > 0 && progress.streakDays.length % 5 === 0) {
      setShowConfetti(true);
      triggered = true;
    }
    if (progress.overall === 100) {
      // Adjusted for percentage scale
      setShowConfetti(true);
      triggered = true;
    }
    let timer: NodeJS.Timeout | undefined;
    if (triggered) {
      timer = setTimeout(() => setShowConfetti(false), 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [progress.streakDays, progress.overall]);

  // Derive weekly activity
  const getWeeklyActivity = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateISO = date.toISOString().slice(0, 10);
      const isActive = progress.streakDays.some((d) => new Date(d).toISOString().slice(0, 10) === dateISO);
      return {
        day,
        active: isActive,
        lessons: isActive ? 1 : 0, // Simplified; adjust if API provides lesson count per day
      };
    });
  };

  const weeklyActivity = getWeeklyActivity();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "reading":
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      case "quiz":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "assignment":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "project":
        return <FileText className="h-4 w-4 text-indigo-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Videos";
      case "reading":
        return "Readings";
      case "quiz":
        return "Quizzes";
      case "assignment":
        return "Assignments";
      case "project":
        return "Projects";
      default:
        return type;
    }
  };

  // Calculate percent values rounded to two decimal places
  const percent = Number(((progress.overall ?? 0) * 100).toFixed(2));
  const chapterProgress = {
    totalChapters: chapters.length,
    completedChapters: chapters.filter((c) => c.isCompleted).length,
    percentage:
      chapters.length > 0
        ? Number(
            (
              (chapters.filter((c) => c.isCompleted).length / chapters.length) *
              100
            ).toFixed(2)
          )
        : 0,
  };
  const lessonPercent =
    progress.totalLessons > 0
      ? Number(((progress.completedLessons / progress.totalLessons) * 100).toFixed(2))
      : 0;

      Logger.info("Lesson Parcantage",lessonPercent)

  return (
    <div className="space-y-4">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={700}
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
        />
      )}

      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Progress</h3>
      </div>

      {/* Completion Progress Overview */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Completion Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Courses</span>
              </div>
              <div className="text-sm text-muted-foreground">{progress.overall === 100 ? 1 : 0}/1</div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={percent} className="flex-1 h-2" />
              <span className="text-xs font-medium w-10">{percent}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Chapters</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {chapterProgress.completedChapters}/{chapterProgress.totalChapters}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={chapterProgress.percentage} className="flex-1 h-2" />
              <span className="text-xs font-medium w-10">{chapterProgress.percentage}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Lessons</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {progress.completedLessons}/{progress.totalLessons}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={progress.totalLessons > 0 ? (progress.completedLessons / progress.totalLessons) * 100 : 0}
                className="flex-1 h-2"
              />
              <span className="text-xs font-medium w-10">
                {progress.totalLessons > 0 ? Math.round((progress.completedLessons / progress.totalLessons) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress by Content Type */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progress by Content Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(progress.byType).map(([type, percentage]) => {
            const roundedTypePercent = Number(Number(percentage).toFixed(2));
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm font-medium capitalize">{getTypeLabel(type)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{roundedTypePercent}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={roundedTypePercent} className="flex-1 h-2" />
                  <span className="text-xs font-medium w-10">{roundedTypePercent}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly Activity Calendar */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Week's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors hover:scale-105",
                    day.active
                      ? "bg-green-100 text-green-700 border-2 border-green-200"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}
                >
                  {day.lessons}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm font-medium">Current Streak: {progress.streak} days</div>
            <div className="text-xs text-muted-foreground">Longest: {longestStreak.length} days</div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{percent}%</div>
            <div className="text-xs text-muted-foreground">
              {progress.completedLessons} of {progress.totalLessons} lessons completed
            </div>
          </div>
          <Progress value={percent} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats with animation and tooltips */}
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-lg font-bold">{progress.timeSpent}</div>
                    <div className="text-xs text-muted-foreground">Time Spent</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>How much time you've spent learning in this cohort.</TooltipContent>
            </Tooltip>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-lg font-bold">{progress.streak}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Your current streak of consecutive learning days.</TooltipContent>
            </Tooltip>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-lg font-bold">{progress.xp ?? 0}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Experience points earned for completing lessons.</TooltipContent>
            </Tooltip>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-lg font-bold">{Array.isArray(progress.streakDays) ? progress.streakDays.length : 0}</div>
                    <div className="text-xs text-muted-foreground">Streak Days</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Total days you've learned in this cohort.</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </TooltipProvider>
      {/* Streak Calendar */}
      {Array.isArray(progress.streakDays) && progress.streakDays.length > 0 && (
        <TooltipProvider>
          <div className="mt-8 space-y-4">
            <div className="font-semibold text-sm flex items-center gap-2 text-primary">
              <Award className="h-4 w-4 text-yellow-500 animate-bounce" />
              <span>Streak Calendar</span>
            </div>

            <div className="flex flex-wrap gap-2 w-full max-w-3xl mx-auto justify-center">
              {progress.streakDays.map((date, idx) => {
                const dayISO = new Date(date).toISOString().slice(0, 10);
                const isToday = dayISO === new Date().toISOString().slice(0, 10);
                const inLongest = longestStreak.includes(dayISO);
                const displayDate = new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.03 * idx }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm cursor-pointer", isToday ? "bg-green-500 text-white border-green-700 shadow-lg animate-pulse" : inLongest ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none shadow-md" : "bg-muted text-primary border-primary/30 hover:bg-primary/10"
                          )}
                        >
                          {displayDate}
                          {isToday && <span className="ml-1 font-bold">★</span>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        {isToday ? "(Today)" : ""}
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </div>

            {longestStreak.length > 1 && (
              <div className="text-xs text-muted-foreground text-center mt-2">
                Longest streak:{" "}
                <span className="font-medium">{longestStreak.length} days</span> (
                {new Date(longestStreak[0]).toLocaleDateString()} to{" "}
                {new Date(longestStreak[longestStreak.length - 1]).toLocaleDateString()})
              </div>
            )}
          </div>
        </TooltipProvider>
      )}


      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {progress.achievements.map((achievement, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {achievement}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}