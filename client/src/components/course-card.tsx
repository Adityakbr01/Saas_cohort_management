import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, Users } from "lucide-react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    instructor: string
    duration: string
    level: "Beginner" | "Intermediate" | "Advanced"
    rating: number
    students: number
    thumbnail: string
    price: string
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const levelColors = {
    Beginner: "bg-green-100 text-green-800 hover:bg-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Advanced: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={`${course.title} course thumbnail`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="absolute top-4 left-4">
            <Badge className={levelColors[course.level]}>{course.level}</Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/90">
              {course.price}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="font-medium">By {course.instructor}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString()} students</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link to={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
