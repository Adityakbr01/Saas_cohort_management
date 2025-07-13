// File: CourseTabs.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Globe, GraduationCap, Play, Star } from "lucide-react";
import { memo } from "react";

type Course = {
  longDescription: string;
  syllabus: { title: string; lessons: number; duration: string; topics: string[] }[];
  instructor: { name: string; bio: string; avatar: string; rating: number; students: number; courses: number };
  rating: number;
  reviewCount: number;
  reviews: { id: number; name: string; avatar: string; rating: number; date: string; comment: string }[];
  ratingsDistribution?: Record<string, number>;
  certificate: boolean;
  downloadable: boolean;
};

type RatingsPercentage = { rating: number; percentage: string; count: number };

function CourseTabs({ course, totalLessons, totalDuration, ratingsPercentages }: { course: Course; totalLessons: number; totalDuration: string; ratingsPercentages: RatingsPercentage[] }) {
  return (
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
              <div className="text-center" aria-label="Certificate of completion">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Certificate</p>
                <p className="text-sm text-muted-foreground">Of completion</p>
              </div>
              <div className="text-center" aria-label="Lifetime access">
                <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Lifetime</p>
                <p className="text-sm text-muted-foreground">Access</p>
              </div>
              <div className="text-center" aria-label="Downloadable resources">
                <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Downloadable</p>
                <p className="text-sm text-muted-foreground">Resources</p>
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
          {
            (!course.syllabus || course.syllabus.length === 0) && (
              <p className="text-muted-foreground text-center" aria-label="No syllabus available">
                No syllabus available yet. Be the first to share your feedback!
              </p>
            )
          }
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
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(course.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Course Rating ({course.reviewCount} reviews)</p>
                </div>
                <div className="flex-1">
                  {ratingsPercentages.map(({ rating, percentage, count }) => (
                    <div key={rating} className="flex items-center gap-2 mb-1" aria-label={`Rating ${rating} stars: ${count} reviews`}>
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Progress value={parseFloat(percentage)} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-8">{percentage}%</span>
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
  );
}

export default memo(CourseTabs);