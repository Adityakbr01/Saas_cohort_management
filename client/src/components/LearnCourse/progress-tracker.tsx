import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, BookOpen, FileText, Play, Award } from "lucide-react"
import type { ProgressData } from "@/types/cohort"
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface ProgressTrackerProps {
  progress: ProgressData
  
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  
  console.log(progress)
  // Calculate today and longest streak
  // Find the longest streak (consecutive days)
  const [longestStreak, setLongestStreak] = useState<string[]>([]);
  useEffect(() => {
    if (!Array.isArray(progress.streakDays) || progress.streakDays.length === 0) return;
    // Sort and dedupe
    const days = Array.from(new Set(progress.streakDays.map(d => new Date(d).toISOString().slice(0, 10)))).sort();
    let maxStreak: string[] = [];
    let currentStreak: string[] = [];
    for (let i = 0; i < days.length; i++) {
      if (i === 0 || (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime() === 86400000)) {
        currentStreak.push(days[i]);
      } else {
        if (currentStreak.length > maxStreak.length) maxStreak = [...currentStreak];
        currentStreak = [days[i]];
      }
    }
    if (currentStreak.length > maxStreak.length) maxStreak = [...currentStreak];
    setLongestStreak(maxStreak);
  }, [progress.streakDays]);

  // Confetti for new milestone (e.g., every 5 streak days)
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (progress.streakDays && progress.streakDays.length > 0 && progress.streakDays.length % 5 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress.streakDays]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />
      case "reading":
        return <BookOpen className="h-4 w-4 text-orange-500" />
      case "quiz":
        return <FileText className="h-4 w-4 text-green-500" />
      case "assignment":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Videos"
      case "reading":
        return "Readings"
      case "quiz":
        return "Quizzes"
      case "assignment":
        return "Assignments"
      default:
        return type
    }
  }

  const percent = Math.round((progress.overall ?? 0) * 100);


  return (
    <div className="space-y-4">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Progress</h3>
      </div>

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
            <div className="text-2xl font-bold text-primary">
              {Math.round((progress.overall ?? 0) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {progress.completedLessons} of {progress.totalLessons} lessons completed
            </div>
          </div>
          <Progress value={percent} className="h-3" />
        </CardContent>
      </Card>

      {/* Progress by Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progress by Content Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(progress.byType).map(([type, value]) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)}</span>
                </div>
                <span className="font-medium">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05 }}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05 }}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05 }}>
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
        <div className="mt-6">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" /> Streak Calendar
          </div>
          <div className="flex flex-wrap gap-2 w-full max-w-2xl mx-auto justify-center">
            {progress.streakDays.map((date, idx) => {
              const dayISO = new Date(date).toISOString().slice(0, 10);
              const isToday = dayISO === new Date().toISOString().slice(0, 10);
              const inLongest = longestStreak.includes(dayISO);
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 * idx }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
                    ${isToday ? "bg-green-500 text-white border-green-700" : inLongest ? "bg-primary/20 border-primary/60 text-primary" : "bg-primary/10 text-primary border-primary/20"}
                  `}
                  title={new Date(date).toLocaleDateString() + (isToday ? " (Today)" : "")}
                >
                  {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {isToday && <span className="ml-1 font-bold">★</span>}
                </motion.div>
              );
            })}
          </div>
          {longestStreak.length > 1 && (
            <div className="text-xs text-muted-foreground mt-2 text-center">Longest streak: {longestStreak.length} days ({longestStreak[0]} to {longestStreak[longestStreak.length-1]})</div>
          )}
        </div>
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
  )
}
