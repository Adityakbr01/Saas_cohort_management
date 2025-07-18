import { ArrowLeft, Clock, Globe, Users } from "lucide-react";
import RatingDisplay from "../RatingDisplay";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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
};


// Course Header Component
function CourseHeader({ course }: { course: Course }) {

  return (
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
          <RatingDisplay
            averageRating={course.rating}
            totalRatings={course.reviewCount}
            ratingsDistribution={course.ratingsDistribution ? {
              1: course.ratingsDistribution["1"],
              2: course.ratingsDistribution["2"],
              3: course.ratingsDistribution["3"],
              4: course.ratingsDistribution["4"],
              5: course.ratingsDistribution["5"],
            } : undefined}
          />
          <div className="flex items-center gap-1" aria-label={`${course.students.toLocaleString()} students enrolled`}>
            <Users className="h-4 w-4" />
            <span>{(Array.isArray(course.students) ? course.students.length : course.students).toLocaleString() || 0} students</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Duration: ${course.duration}`}>
            <Clock className="h-4 w-4" />
            <span>{course.duration} week</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Last updated: ${course.lastUpdated}`}>
            <Globe className="h-4 w-4" />
            <span>Last updated {course.lastUpdated}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CourseHeader;