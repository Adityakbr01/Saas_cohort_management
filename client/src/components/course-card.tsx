import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Clock, Star, Users, ArrowRight, Bookmark, BookmarkCheck, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

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
  }
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
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]")
    setBookmarked(bookmarks.includes(course._id))
  }, [course._id])

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]")
    let updatedBookmarks
    if (bookmarks.includes(course._id)) {
      updatedBookmarks = bookmarks.filter((id: string) => id !== course._id)
      setBookmarked(false)
    } else {
      updatedBookmarks = [...bookmarks, course._id]
      setBookmarked(true)
    }
    localStorage.setItem("bookmarkedCourses", JSON.stringify(updatedBookmarks))
  }

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
            <Badge variant="secondary" className={CoursePrice[priceKey]} aria-label={`Price: ${course.price || "Free"}`}>
             ₹{course.price || "Free"}
            </Badge>
          </div>

          {/* 🔖 Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white/100 p-2 rounded-full shadow-md transition-all"
            aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" aria-label="Course short description">
          {course.shortDescription}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
         <span className="font-medium flex items-center gap-1" aria-label={`Mentor: ${course.mentor?.name || "Unknown"}`}>
  <GraduationCap className="h-4 w-4 text-muted-foreground" />
  By {course.mentor?.name || "Unknown"}
</span>
          <div className="flex items-center gap-1" aria-label={`Rating: ${course.rating ?? 0}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating ?? 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" aria-label={`Duration: ${course.duration}`}>
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${course.students.toLocaleString()} students enrolled`}>
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString() || 0} students</span>
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
