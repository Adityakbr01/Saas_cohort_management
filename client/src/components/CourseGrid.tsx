import CourseCard from "@/components/course-card"

import { useGetCohortsQuery } from "@/store/features/api/cohorts/cohorts.api"
import type { Cohort } from "@/types"
import CourseCardSkeleton from "./CourseCardSkeleton"





export default function CourseGrid() {

  const { data, isLoading } = useGetCohortsQuery(undefined, {
    skip: false,
  })

  const{cohorts}  = data?.data || []


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
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
            : cohorts && cohorts.map((course:Cohort,index:number) => <CourseCard key={index} course={course} />)}
        </div>

        {!isLoading && (
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
