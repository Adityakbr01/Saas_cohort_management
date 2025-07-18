// File: CourseDetailPage.tsx
import NotFound404 from "@/components/404/NotFound404";
import CourseHeader from "@/components/courseDetail/CourseHeader";
import CourseMedia from "@/components/courseDetail/CourseMedia";
import CourseTabs from "@/components/courseDetail/CourseTabs";
import EnrollmentCard from "@/components/courseDetail/EnrollmentCard";
import CourseDetailSkeleton from "@/components/CourseDetailSkeleton";
import { useGetCohortByCourseIdQuery } from "@/store/features/api/cohorts/cohorts.api";
import { formatDuration } from "@/utils/formatDuration";
import formatDuration2 from "@/utils/formatDuration2";
import useCountdown from "@/utils/useCountDown";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Course type definition
type Course = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: {
    name: string;
    bio: string;
    avatar: string;
    rating: number;
    students: number;
    courses: number;
  };
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  students: number;
  reviewCount: number;
  thumbnail: string;
  demoVideo: string;
  price: string;
  originalPrice: string;
  discount: number;
  language: string;
  lastUpdated: string;
  certificate: boolean;
  syllabus: {
    title: string;
    lessons: number;
    duration: string;
    topics: string[];
  }[];
  reviews: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  limitedTimeOffer: {
    isActive: boolean;
    startDate: string;
    endDate: string;
  };
  ratingsDistribution: Record<string, number>;
  downloadable: boolean;
  activateOn: string;
};

type Chapter = {
  title: string;
  lessons: Lesson[];
  totalDuration: number;
};

type Lesson = {
  title: string;
  duration: number;
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = id ?? "";
  const { data: cohort, isLoading, error, refetch } = useGetCohortByCourseIdQuery(courseId);
  // Bookmark state management
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (courseId) {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]");
      setBookmarked(bookmarks.includes(courseId));
    }
  }, [courseId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCourses") || "[]");
    let updatedBookmarks: string[];
    if (bookmarks.includes(courseId)) {
      updatedBookmarks = bookmarks.filter((id: string) => id !== courseId);
      setBookmarked(false);
    } else {
      updatedBookmarks = [...bookmarks, courseId];
      setBookmarked(true);
    }
    localStorage.setItem("bookmarkedCourses", JSON.stringify(updatedBookmarks));
  };

  // Memoize course data
  const course: Course = useMemo(() => {
    if (!cohort?.data) return {} as Course;
    return {
      id: cohort.data._id || "",
      title: cohort.data.title || "Untitled Course",
      description: cohort.data.shortDescription || "No description available",
      longDescription: cohort.data.description || "No detailed description available",
      instructor: {
        name: cohort.data.mentor?.name || "Unknown Instructor",
        bio: cohort.data.mentor?.specialization && cohort.data.mentor?.experience
          ? `${cohort.data.mentor.specialization} - ${cohort.data.mentor.experience}`
          : "No bio available",
        avatar: cohort.data.mentor?.profileImageUrl || "/placeholder.svg",
        rating: cohort.data.mentor?.overallRating || 0,
        students: cohort.data.mentor?.studentsCount || 0,
        courses: cohort.data.mentor?.cohortsCount || 0,
      },
      duration: cohort.data.duration || formatDuration2(cohort.data.chapters?.reduce((acc: number, chapter: Chapter) => acc + (chapter.totalDuration || 0), 0) || 0),
      level: cohort.data.difficulty || "Beginner",
      rating: cohort.data.averageRating || 0,
      students: cohort.data?.students || 0,
      reviewCount: cohort.data.totalRatings || 0,
      thumbnail: cohort.data.Thumbnail || "/placeholder.svg",
      demoVideo: cohort.data.demoVideo || "",
      price: cohort.data.price ? `₹${cohort.data.price}` : "Free",
      originalPrice: cohort.data.originalPrice ? `₹${cohort.data.originalPrice}` : cohort.data.price ? `$${cohort.data.price}` : "Free",
      discount: cohort.data.discount || 0,
      language: cohort.data.language || "English",
      lastUpdated: cohort.data.updatedAt ? format(new Date(cohort.data.updatedAt), "MMM yyyy") : "Unknown",
      certificate: cohort.data.certificateAvailable || false,
      syllabus: (cohort.data.chapters || []).map((chapter: Chapter) => ({
        title: chapter.title || "Untitled Chapter",
        lessons: chapter.lessons?.length || 0,
        duration: (chapter.lessons?.reduce((acc: number, lesson: Lesson) => acc + (lesson.duration || 0), 0) || 0),
        topics: chapter.lessons?.map((lesson: Lesson) => lesson.title || "Untitled Lesson") || [],
      })),
      reviews: [],
      limitedTimeOffer: cohort.data.limitedTimeOffer || { isActive: false, startDate: "", endDate: "" },
      ratingsDistribution: cohort.data.ratingsDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      downloadable: cohort.data.isDownloadable || false,
      activateOn: cohort.data.activateOn || "", // ✅ NEW FIELD
    };
  }, [cohort]);

  const offerEndTime = course.limitedTimeOffer?.endDate || null;
  const isOfferValid =
    course.limitedTimeOffer?.isActive &&
    offerEndTime &&
    !isNaN(new Date(offerEndTime).getTime());


  const countdown = useCountdown(
    isOfferValid ? offerEndTime : null,
  );

  const isUpcoming = useMemo(() => {
    return course?.activateOn
      ? new Date(course.activateOn).getTime() > Date.now()
      : false;
  }, [course?.activateOn]);

  const launchCountdown = useCountdown(
    isUpcoming ? course.activateOn : null,
  );

  // Memoize total lessons and duration
  const totalLessons = useMemo(() => course.syllabus?.reduce((acc, s) => acc + s.lessons, 0) || 0, [course.syllabus]);
  const totalDuration = useMemo(() => formatDuration(course.syllabus?.reduce((acc, s) => acc + parseInt(s.duration || "0"), 0) || 0), [course.syllabus]);

  // Calculate ratings distribution percentages
  const ratingsPercentages = useMemo(() => {
    if (!course.ratingsDistribution) return [];
    const total = course.reviewCount || 1;
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      percentage: (
        ((course.ratingsDistribution?.[rating.toString()] || 0) / total) * 100
      ).toFixed(0),
      count: course.ratingsDistribution?.[rating.toString()] || 0,
    }));
  }, [course.ratingsDistribution, course.reviewCount]);


  if (isLoading) {
    return <CourseDetailSkeleton />;
  }


  if (error || !course.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <NotFound404 message="Course not found" />
      </div>
    );
  }

  // JSON-LD for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "d.k college",
    },
    courseCode: course.id,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration,
      inLanguage: course.language,
      startDate: course.limitedTimeOffer?.startDate || course.lastUpdated,
      endDate: course.limitedTimeOffer?.endDate || null,
    },
    instructor: {
      "@type": "Person",
      name: course.instructor.name,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: course.rating,
      reviewCount: course.reviewCount,
    },
  };

  return (
    <main className="min-h-screen bg-background w-full" lang="en" dir="ltr">
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8" aria-label="Course details">
            <CourseHeader course={course} />
            <CourseMedia course={course} bookmarked={bookmarked} toggleBookmark={toggleBookmark} />
            <CourseTabs course={course} totalLessons={totalLessons} totalDuration={totalDuration} ratingsPercentages={ratingsPercentages} />
          </section>
          <EnrollmentCard refetch={refetch} course={course} countdown={countdown} isUpcoming={isUpcoming} launchCountdown={launchCountdown} bookmarked={bookmarked} toggleBookmark={toggleBookmark} />
        </div>
      </div>
    </main>
  );
}