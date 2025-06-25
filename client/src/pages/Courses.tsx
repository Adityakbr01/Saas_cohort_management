import { Suspense } from "react"
import CourseFilters from "@/components/Course-filters"
import CourseList from "@/components/Course-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"


export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-muted-foreground">
            Discover our complete catalog of courses and find the perfect learning path for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <CourseFilters />
          </aside>
          <main className="lg:col-span-3">
            <Suspense fallback={<div>Loading courses...</div>}>
              <CourseList />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
