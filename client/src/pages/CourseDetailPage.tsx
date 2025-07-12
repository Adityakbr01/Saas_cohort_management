
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, Star, Play, Download, BadgeIcon as Certificate, Globe, Bookmark, BookmarkCheck, BookOpen } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetCohortByCourseIdQuery } from "@/store/features/api/cohorts/cohorts.api";
import { useEffect, useState, useMemo } from "react";
import formatDuration2 from "@/utils/formatDuration2";
import { format } from "date-fns";
import useCountdown from "@/utils/useCountDown";
import CourseDetailSkeleton from "@/components/CourseDetailSkeleton";

// Course type definition based on API response
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
  price: string;
  originalPrice: string;
  discount: number;
  language: string;
  lastUpdated: string;
  certificate: boolean;
  downloadable: boolean;
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
    let updatedBookmarks;
    if (bookmarks.includes(courseId)) {
      updatedBookmarks = bookmarks.filter((id: string) => id !== courseId);
      setBookmarked(false);
    } else {
      updatedBookmarks = [...bookmarks, courseId];
      setBookmarked(true);
    }
    localStorage.setItem("bookmarkedCourses", JSON.stringify(updatedBookmarks));
  };



  // Memoize course data to avoid recomputation on re-renders
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
      rating: cohort.data.mentor?.overallRating || 0,
      students: cohort.data.mentor?.studentsCount || 0,
      reviewCount: 0, // Placeholder: Update when API provides reviews
      thumbnail: cohort.data.Thumbnail || "/placeholder.svg",
      price: cohort.data.price || "Free",
      originalPrice: cohort.data.originalPrice || cohort.data.price || "Free",
      discount: cohort.data.discount || 0,
      language: cohort.data.language || "English",
      lastUpdated: cohort.data.updatedAt ? format(new Date(cohort.data.updatedAt), "MMM yyyy") : "Unknown",
      certificate: cohort.data.certificateAvailable || false,
      downloadable: cohort.data.downloadable || false,
      syllabus: (cohort.data.chapters || []).map((chapter: Chapter) => ({
        title: chapter.title || "Untitled Chapter",
        lessons: chapter.lessons?.length || 0,
        duration: formatDuration2(chapter.totalDuration || 0),
        topics: chapter.lessons?.map((lesson: Lesson) => lesson.title || "Untitled Lesson") || [],
      })),
      reviews: [], // Placeholder: Update when API provides reviews
      limitedTimeOffer: cohort.data.limitedTimeOffer || { isActive: false, startDate: "", endDate: "" },
    };
  }, [cohort]);

  const offerEndTime = course?.limitedTimeOffer?.endDate;
const isOfferValid =
  course?.limitedTimeOffer?.isActive &&
  offerEndTime &&
  !isNaN(new Date(offerEndTime).getTime());

const countdown = useCountdown(isOfferValid ? offerEndTime : null);


  // Memoize total lessons and duration for syllabus
  const totalLessons = useMemo(() => course.syllabus?.reduce((acc, s) => acc + s.lessons, 0) || 0, [course.syllabus]);
  const totalDuration = useMemo(() => formatDuration2(course.syllabus?.reduce((acc, s) => acc + parseInt(s.duration || "0"), 0) || 0), [course.syllabus]);


  if (isLoading) {
    return <CourseDetailSkeleton />
  }

  if (error || !course.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center py-8 text-destructive" aria-label="Error loading course details">
          <p>Failed to load course details. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4 hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
            onClick={refetch}
            aria-label="Retry loading course details"
            tabIndex={0}
          >
            Retry
          </Button>
        </div>
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
      name: "Your Platform Name", // Replace with actual platform name
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
    <main className="min-h-screen bg-background w-full " lang="en" dir="ltr">
      {/* SEO: Structured data for course */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      {/* SEO: Meta tags (use React Helmet or Next.js Head in _app.tsx or page wrapper) */}
      {/* Example:
        <Helmet>
          <title>{course.title} | Course Details</title>
          <meta name="description" content={course.description} />
          <meta property="og:title" content={course.title} />
          <meta property="og:description" content={course.description} />
          <meta property="og:image" content={course.thumbnail} />
          <meta property="og:type" content="website" />
        </Helmet>
      */}
      <div className="container mx-auto px-4 py-8">
        <section aria-label="Course navigation">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              aria-label="Go back to courses list"
              className="focus:ring-2 focus:ring-primary group cursor-pointer"
              tabIndex={0}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Courses
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8" aria-label="Course details">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" aria-label={`Difficulty: ${course.level}`}>
                  {course.level}
                </Badge>
                <Badge variant="outline" aria-label={`Language: ${course.language}`}>
                  {course.language}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 line-clamp-2 hover:text-primary transition-colors">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6 line-clamp-3" aria-label="Course short description">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" aria-label={`Rating: ${course.rating}`}>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`${course.students.toLocaleString()} students enrolled`}>
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Duration: ${course.duration}`}>
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Last updated: ${course.lastUpdated}`}>
                  <Globe className="h-4 w-4" />
                  <span>Last updated {course.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={course.thumbnail}
                srcSet={`${course.thumbnail}?w=320 320w, ${course.thumbnail}?w=640 640w, ${course.thumbnail}?w=1280 1280w`}
                sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                alt={`${course.title} course thumbnail`}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
                  aria-label="Watch course demo video"
                  tabIndex={0}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
                <button
                  onClick={toggleBookmark}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white/100 hover:scale-110 p-2 rounded-full shadow-md transition-all focus:ring-2 focus:ring-primary"
                  aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                  title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                  tabIndex={0}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full" aria-label="Course information tabs">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" aria-label="View course overview" aria-controls="overview-panel" tabIndex={0}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="syllabus" aria-label="View course syllabus" aria-controls="syllabus-panel" tabIndex={0}>
                  Syllabus
                </TabsTrigger>
                <TabsTrigger value="instructor" aria-label="View instructor details" aria-controls="instructor-panel" tabIndex={0}>
                  Instructor
                </TabsTrigger>
                <TabsTrigger value="reviews" aria-label="View student reviews" aria-controls="reviews-panel" tabIndex={0}>
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" id="overview-panel" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed" aria-label="Course long description">
                      {course.longDescription}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center" aria-label={`Total lessons: ${totalLessons}, total duration: ${totalDuration}`}>
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{totalLessons} Lessons</p>
                        <p className="text-sm text-muted-foreground">{totalDuration}</p>
                      </div>
                      <div className="text-center" aria-label="Downloadable resources">
                        <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Downloadable</p>
                        <p className="text-sm text-muted-foreground">Resources</p>
                      </div>
                      <div className="text-center" aria-label="Certificate of completion">
                        <Certificate className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Certificate</p>
                        <p className="text-sm text-muted-foreground">Of completion</p>
                      </div>
                      <div className="text-center" aria-label="Lifetime access">
                        <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Lifetime</p>
                        <p className="text-sm text-muted-foreground">Access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="syllabus" id="syllabus-panel" className="mt-6">
                <div className="space-y-4">
                  {course.syllabus.map((section, index) => (
                    <article key={index} aria-label={`Syllabus section: ${section.title}`}>
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{section.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {section.lessons} lessons • {section.duration}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {section.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="flex items-center gap-2 text-sm" aria-label={`Topic: ${topic}`}>
                                <Play className="h-3 w-3 text-muted-foreground" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructor" id="instructor-panel" className="mt-6">
                <Card aria-label="Instructor details">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={course.instructor.avatar}
                          srcSet={`${course.instructor.avatar}?w=80 80w, ${course.instructor.avatar}?w=160 160w`}
                          sizes="(max-width: 640px) 80px, 160px"
                          alt={`${course.instructor.name}'s profile picture`}
                          loading="lazy"
                          decoding="async"
                        />
                        <AvatarFallback>
                          {course.instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{course.instructor.name}</h3>
                        <p className="text-muted-foreground mb-4" aria-label="Instructor bio">
                          {course.instructor.bio}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div aria-label={`Instructor rating: ${course.instructor.rating}`}>
                            <p className="font-medium">{course.instructor.rating}</p>
                            <p className="text-muted-foreground">Instructor Rating</p>
                          </div>
                          <div aria-label={`Total students: ${course.instructor.students.toLocaleString()}`}>
                            <p className="font-medium">{course.instructor.students.toLocaleString()}</p>
                            <p className="text-muted-foreground">Students</p>
                          </div>
                          <div aria-label={`Total courses: ${course.instructor.courses}`}>
                            <p className="font-medium">{course.instructor.courses}</p>
                            <p className="text-muted-foreground">Courses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" id="reviews-panel" className="mt-6">
                <div className="space-y-6">
                  <Card aria-label="Student reviews summary">
                    <CardHeader>
                      <CardTitle>Student Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-center" aria-label={`Course rating: ${course.rating}`}>
                          <div className="text-4xl font-bold">{course.rating}</div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Course Rating</p>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-2 mb-1" aria-label={`Rating ${rating} stars`}>
                              <span className="text-sm w-3">{rating}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <Progress value={rating === 5 ? 70 : rating === 4 ? 20 : 5} className="flex-1" />
                              <span className="text-sm text-muted-foreground w-8">
                                {rating === 5 ? "70%" : rating === 4 ? "20%" : "5%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-4" aria-label="Individual student reviews">
                    {course.reviews.length > 0 ? (
                      course.reviews.map((review) => (
                        <article key={review.id} aria-label={`Review by ${review.name}`}>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarImage
                                    src={review.avatar}
                                    srcSet={`${review.avatar}?w=80 80w, ${review.avatar}?w=160 160w`}
                                    sizes="(max-width: 640px) 80px, 160px"
                                    alt={`${review.name}'s profile picture`}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  <AvatarFallback>
                                    {review.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{review.name}</h4>
                                    <div className="flex items-center gap-1" aria-label={`Rating: ${review.rating} stars`}>
                                      {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{review.date}</span>
                                  </div>
                                  <p className="text-muted-foreground">{review.comment}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </article>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center" aria-label="No reviews available">
                        No reviews available yet. Be the first to share your feedback!
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="lg:col-span-1" aria-label="Course enrollment details">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold">{course.price || "Free"}</span>
                    {course.originalPrice && course.originalPrice !== course.price && (
                      <span className="text-lg text-muted-foreground line-through">{course.originalPrice}</span>
                    )}
                  </div>
                  {course.discount > 0 && (
                    <p className="text-sm text-muted-foreground">{`${course.discount}% off for limited time`}</p>
                  )}
                  {course.limitedTimeOffer?.isActive && countdown && (
                    <div className=" text-xs px-3 py-2 rounded-md flex items-center justify-center font-NeuMechina mt-4">
                      <span className="font-medium">
                        🔥 Limited Offer Ends In:
                        <span className="sr-only">
                          Offer ends on {course.limitedTimeOffer.endDate ? new Date(course.limitedTimeOffer.endDate).toLocaleString() : "unknown date"}
                        </span>
                      </span>
                      <span className="ml-2 font-NeuMechina" aria-label="Time left for limited time offer">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 mb-6">
                  <Button
                    className="w-full hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
                    size="lg"
                    aria-label="Enroll in the course"
                    tabIndex={0}
                  >
                    Enroll Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
                    aria-label="Add course to wishlist"
                    tabIndex={0}
                  >
                    Add to Wishlist
                  </Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between" aria-label={`Duration: ${course.duration}`}>
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between" aria-label={`Level: ${course.level}`}>
                    <span className="text-muted-foreground">Level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex justify-between" aria-label={`Language: ${course.language}`}>
                    <span className="text-muted-foreground">Language:</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex justify-between" aria-label={`Certificate: ${course.certificate ? "Yes" : "No"}`}>
                    <span className="text-muted-foreground">Certificate:</span>
                    <span>{course.certificate ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between" aria-label={`Downloadable: ${course.downloadable ? "Yes" : "No"}`}>
                    <span className="text-muted-foreground">Downloadable:</span>
                    <span>{course.downloadable ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
