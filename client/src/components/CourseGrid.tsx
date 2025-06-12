import { useState, useEffect } from "react"
import CourseCard from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

const mockCourses = [
  {
    id: "1",
    title: "Complete React Development Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and modern patterns.",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    level: "Intermediate",
    rating: 4.8,
    students: 15420,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$89",
  },
  {
    id: "2",
    title: "Python for Data Science",
    description: "Learn Python programming with focus on data analysis, visualization, and machine learning.",
    instructor: "Dr. Michael Chen",
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.9,
    students: 23150,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$79",
  },
  {
    id: "3",
    title: "Advanced JavaScript Patterns",
    description: "Deep dive into advanced JavaScript concepts, design patterns, and performance optimization.",
    instructor: "Alex Rodriguez",
    duration: "6 weeks",
    level: "Advanced",
    rating: 4.7,
    students: 8930,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$99",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design with hands-on projects.",
    instructor: "Emma Thompson",
    duration: "10 weeks",
    level: "Beginner",
    rating: 4.6,
    students: 12780,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$69",
  },
  {
    id: "5",
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and learn to build scalable cloud applications.",
    instructor: "David Kumar",
    duration: "14 weeks",
    level: "Intermediate",
    rating: 4.8,
    students: 9650,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$129",
  },
  {
    id: "6",
    title: "Mobile App Development with Flutter",
    description: "Build cross-platform mobile applications using Flutter and Dart programming language.",
    instructor: "Lisa Park",
    duration: "16 weeks",
    level: "Intermediate",
    rating: 4.7,
    students: 7420,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$109",
  },
]

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden pt-0">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full" />
      </CardHeader>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

export default function CourseGrid() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setCourses(mockCourses)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular courses taught by industry experts. Start learning today and advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
            : courses.map((course,index) => <CourseCard key={index} course={course} />)}
        </div>

        {!loading && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              View All Courses
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
