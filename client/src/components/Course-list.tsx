"use client"

import { useState } from "react"
import CourseCard from "./course-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Extended mock data for demonstration
const allCourses = [
  {
    id: "1",
    title: "Complete React Development Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and modern patterns.",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    level: "Intermediate" as const,
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
    level: "Beginner" as const,
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
    level: "Advanced" as const,
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
    level: "Beginner" as const,
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
    level: "Intermediate" as const,
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
    level: "Intermediate" as const,
    rating: 4.7,
    students: 7420,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$109",
  },
  // Additional courses for pagination demo
  {
    id: "7",
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms and their practical applications.",
    instructor: "Dr. James Wilson",
    duration: "10 weeks",
    level: "Intermediate" as const,
    rating: 4.5,
    students: 11200,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$95",
  },
  {
    id: "8",
    title: "Digital Marketing Mastery",
    description: "Complete guide to digital marketing including SEO, social media, and content marketing.",
    instructor: "Maria Garcia",
    duration: "8 weeks",
    level: "Beginner" as const,
    rating: 4.4,
    students: 18500,
    thumbnail: "/placeholder.svg?height=200&width=300",
    price: "$75",
  },
]

const COURSES_PER_PAGE = 6

export default function CourseList() {
  const [courses, setCourses] = useState(allCourses)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("popular")

  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE)
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE
  const endIndex = startIndex + COURSES_PER_PAGE
  const currentCourses = courses.slice(startIndex, endIndex)

  const handleSort = (value: string) => {
    setSortBy(value)
    const sortedCourses = [...courses]

    switch (value) {
      case "popular":
        sortedCourses.sort((a, b) => b.students - a.students)
        break
      case "rating":
        sortedCourses.sort((a, b) => b.rating - a.rating)
        break
      case "price-low":
        sortedCourses.sort((a, b) => Number.parseInt(a.price.slice(1)) - Number.parseInt(b.price.slice(1)))
        break
      case "price-high":
        sortedCourses.sort((a, b) => Number.parseInt(b.price.slice(1)) - Number.parseInt(a.price.slice(1)))
        break
    }

    setCourses(sortedCourses)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Sort and Results Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, courses.length)} of {courses.length} courses
        </p>
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCourses.map((course) => (
         <CourseCard
  key={course.id}
  course={{
    _id: course.id,
    title: course.title,
    shortDescription: course.description,
    mentor: { name: course.instructor }, // assuming `course.instructor` is a string
    duration: course.duration,
    difficulty: course.level,
    rating: course.rating,
    students: course.students,
    Thumbnail: course.thumbnail,
    price: course.price
  }}
/>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
