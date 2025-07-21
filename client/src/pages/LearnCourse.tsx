import LearningPortalClient from "@/components/LearnCourse/learning-portal"
import { useNavigate, useParams } from "react-router-dom"
import { useGetEnrolledCoursesQuery } from "@/store/features/api/enrolled/enrolled"
import type { EnrolledCourse } from "@/store/features/api/enrolled/enrolled"

function EnrolledCoursesSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-background">
            <div className="w-16 h-16 bg-muted rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
            </div>
            <div className="w-24 h-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PageProps {
  params?: { cohortId?: string }
}

export default function LearnCourse({ params }: PageProps) {
  const navigate = useNavigate()
  const { cohortId: paramCohortId } = params || {}
  const { cohortId: urlCohortId } = useParams()
  const cohortId = paramCohortId || urlCohortId
  const { data, isLoading, isError, error } = useGetEnrolledCoursesQuery()
  const enrolledCourses: EnrolledCourse[] = data || []


  if (isLoading) return <EnrolledCoursesSkeleton />
  if (isError) {
    const err = error as unknown as { message?: string };
    return <div className="py-20 text-center text-red-500">Failed to load enrolled courses.<br />{err?.message}</div>;
  }

  if (!cohortId) {
    if (enrolledCourses.length === 0) {
      return (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">No Enrolled Courses</h2>
          <p className="text-muted-foreground">You have not enrolled in any courses yet.</p>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-6">Your Enrolled Courses</h1>
        <ul className="space-y-4">
          {enrolledCourses.map((course) => (
            <li key={course.cohortId} className="p-4 rounded-lg border bg-background flex items-center justify-between">
              <div className="flex items-center gap-4">
                {course.thumbnail && <img src={course.thumbnail} alt={course.name} className="w-16 h-16 rounded object-cover" />}
                <div>
                  <div className="font-bold">{course.name}</div>
                  <div className="text-sm text-muted-foreground">{course.shortDescription}</div>
                  <div className="text-xs mt-1">
                    Mentor: {course.mentor && typeof course.mentor === 'object' && 'name' in course.mentor ? course.mentor.name : course.mentor}
                  </div>
                  <div className="text-xs">Price: {course.price}</div>
                </div>
              </div>
              <button
                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition"
                onClick={() => navigate(`/learn/${course.cohortId}`)}
              >
                Go to Course
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const isEnrolled = enrolledCourses.some((c) => c.cohortId === cohortId)
  if (!isEnrolled) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">You are not enrolled in this course.</p>
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition"
          onClick={() => navigate("/enrolled")}
        >
          View My Enrolled Courses
        </button>
      </div>
    )
  }

  return <LearningPortalClient cohortId={cohortId} />
}
