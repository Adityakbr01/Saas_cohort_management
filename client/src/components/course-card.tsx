import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight, Bookmark, BookmarkCheck, Clock, GraduationCap, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import RatingDisplay from "./RatingDisplay"
import { motion, AnimatePresence } from "framer-motion"
interface CourseCardProps {
  course: {
    _id: string
    title: string
    shortDescription: string
    mentor: { name: string } | null | undefined
    duration: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    rating: number | null | undefined
    students: number
    Thumbnail: string
    price: string | null | undefined // values: "Free" or "Paid"
    averageRating?: number
    totalRatings?: number
    status: "upcoming" | "active" | "completed";
    ratingsDistribution?: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  },

}

export default function CourseCard({ course }: CourseCardProps) {
  const levelColors = {
    Beginner: "bg-green-100 text-green-800 hover:bg-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Advanced: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  const CoursePrice = {
    Free: "bg-green-100 text-green-800 hover:bg-green-200",
    Paid: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  }

  const priceKey = (course.price === "Paid" ? "Paid" : "Free") as keyof typeof CoursePrice

  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const bookmarks: string[] = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]");
    setBookmarked(bookmarks.includes(course._id.toString()));
  }, [course._id]);

  const toggleBookmark = () => {
    const bookmarks: string[] = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]");
    const courseId = course._id.toString();
    let updatedBookmarks;

    if (bookmarks.includes(courseId)) {

      updatedBookmarks = bookmarks.filter((id) => id !== courseId);
      setBookmarked(false);
    } else {
      updatedBookmarks = [...bookmarks, courseId];
      setBookmarked(true);
    }
    localStorage.setItem("bookmarkedCourses", JSON.stringify(updatedBookmarks));
  };




  return (
    <Card
      className="group pt-0 transition-all duration-300 hover:-translate-y-1 overflow-hidden rounded-xl border border-muted"
      aria-label={`Course card for ${course.title}`}
    >
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.Thumbnail || "/placeholder.svg"}
            alt={`${course.title} course thumbnail`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute top-4 left-4">
            <Badge className={levelColors[course.difficulty]} aria-label={`Difficulty: ${course.difficulty}`}>
              {course.difficulty}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            {
              (course.status != "upcoming") && (
                <Badge variant="secondary" className={CoursePrice[priceKey]} aria-label={`Price: ${course.price || "Free"}`}>
                  ₹{course.price || "Free"}
                </Badge>
              )
            }
          </div>

          {/* 🔖 Bookmark Button with animation */}
          <motion.button
            onClick={toggleBookmark}
            whileTap={{ scale: 0.8, rotate: -15 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white/100 p-2 rounded-full shadow-md transition-all"
            aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          >
            <AnimatePresence mode="wait">
              {bookmarked ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 900, damping: 60 }}
                >
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="bookmark"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ type: "spring", stiffness: 900, damping: 75 }}
                >
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" aria-label="Course short description">
          {course.shortDescription}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 gap-4">
          <span className="font-medium flex items-center gap-1" aria-label={`Mentor: ${course.mentor?.name || "Unknown"}`}>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            By {course.mentor?.name || "Unknown"}
          </span>
          <RatingDisplay
            averageRating={course.averageRating ?? 0}
            totalRatings={course.totalRatings ?? 0}
            ratingsDistribution={course.ratingsDistribution}
          />
        </div>

        <div className="flex items-center md:gap-4 gap-10  text-sm text-muted-foreground">
          <div className="flex items-center gap-1" aria-label={`Duration: ${course.duration}`}>
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${Array.isArray(course.students) ? course.students.length : course.students} students enrolled`}>
            <Users className="h-4 w-4" />
            <span>{(Array.isArray(course.students) ? course.students.length : course.students).toLocaleString() || 0} students</span>
          </div>

        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link
          to={`/courses/${course._id}`}
          className="w-full"
          aria-label={`View details for ${course.title}`}
        >
          <Button className="w-full group cursor-pointer" variant="outline">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
