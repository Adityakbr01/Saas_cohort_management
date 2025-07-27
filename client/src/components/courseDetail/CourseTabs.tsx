import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRateCohortMutation } from "@/store/features/api/cohorts/cohorts.api";
import { selectCurrentUser } from "@/store/features/slice/UserAuthSlice";
import { BookOpen, CheckCircleIcon, Download, Globe, GraduationCap, Play, Star } from "lucide-react";
import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

type Course = {
  longDescription: string;
  syllabus: { title: string; lessons: number; duration: string; topics: string[] }[];
  instructor: { name: string; bio: string; avatar: string; rating: number; students: number; courses: number };
  rating: number;
  reviewCount: number;
  reviews: { id: number; name: string; avatar: string; rating: number; date: string; comment: string; userId: string, userName: string, updatedAt: string, userRole: string }[];
  ratingsDistribution?: Record<string, number>;
  certificate: boolean;
  downloadable: boolean;
  id: string;

};

type RatingsPercentage = { rating: number; percentage: string; count: number };

function CourseTabs({ course, totalLessons, totalDuration, ratingsPercentages }: { course: Course; totalLessons: number; totalDuration: string; ratingsPercentages: RatingsPercentage[] }) {
  const user = useSelector(selectCurrentUser);
  const [rateCohort] = useRateCohortMutation();
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  // Check if user has already reviewed
  const hasReviewed = user && course.reviews.some(review => review?.userId?.toString() === user._id.toString());

  console.log("Ratings Percentages:", course?.reviews);

  const handleRateCohort = async () => {
    try {
      if (!course.id) {
        toast.error("Course ID is missing");
        return;
      }
      if (!newRating) {
        toast.error("Please select a rating");
        return;
      }
      await rateCohort({ id: course.id, rating: newRating, review: newReview }).unwrap();
      toast.success("Review submitted successfully");
      setNewRating(0);
      setNewReview("");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };


  function getBadgeVariant(userRole: string): "default" | "secondary" | "destructive" | "outline" {
    switch (userRole) {
      case "student":
        return "default"; // standard
      case "mentor":
        return "secondary"; // grayish
      case "organization":
        return "destructive"; // red-like
      default:
        return "outline";
    }
  }


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
                        {section.lessons} lessons • {section.duration}s
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
          {user && !hasReviewed && (
            <Card aria-label="Submit a review">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2" aria-label="Select rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${star <= (hoveredRating || newRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                          }`}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      />
                    ))}
                  </div>
                  <Input
                    placeholder="Write your review here..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="min-h-[100px] resize-y"
                    aria-label="Review text input"
                  />
                  <Button onClick={handleRateCohort} disabled={!newRating} aria-label="Submit review">
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Card aria-label="Student reviews summary">
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center" aria-label={`Course rating: ${course.rating}`}>
                  <div className="text-4xl font-bold">{course.rating.toFixed(1)}</div>
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
              course.reviews.map((review, index) => (
                <article key={review.id || index} aria-label={`Review by ${review.userName}`}>
                  <Card key={review.id || index} >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar>
                          <AvatarImage
                            src={review.avatar}
                            srcSet={`${review.avatar}?w=80 80w, ${review.avatar}?w=160 160w`}
                            sizes="(max-width: 640px) 80px, 160px"
                            alt={`${review.userName}'s profile picture`}
                            loading="lazy"
                            decoding="async"
                          />
                          <AvatarFallback>
                            {review?.userName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-base">{review.userName}</h4>

                            {/* Verified Badge for mentor or organization */}
                            {(review.userRole === "mentor" || review.userRole === "organization") && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            )}
                          </div>

                          {/* Role Badge + "You" Badge */}
                          <div className="flex gap-2 mb-2 flex-wrap">
                            <Badge variant={getBadgeVariant(review.userRole)}>
                              {review.userRole}
                            </Badge>

                            {hasReviewed && (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                You
                              </Badge>
                            )}
                          </div>

                          {/* Rating Stars */}
                          <div className="flex items-center gap-1 mb-2" aria-label={`Rating: ${review.rating} stars`}>
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>

                          {/* Review Date */}
                          <span className="text-xs text-muted-foreground block mb-2">
                            {review.updatedAt ? new Date(review.updatedAt).toLocaleString('en-IN') : ''}
                          </span>

                          {/* Comment */}
                          <p className="text-muted-foreground text-sm">{review.comment}</p>
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