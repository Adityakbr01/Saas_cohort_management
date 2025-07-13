// File: EnrollmentCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Course = {
  price: string;
  originalPrice: string;
  discount: number;
  limitedTimeOffer?: { isActive: boolean; endDate?: string };
  duration: string;
  level: string;
  language: string;
  certificate: boolean;
};

function EnrollmentCard({ course, countdown }: { course: Course; countdown?: string }) {
  return (
    <aside className="lg:col-span-1" aria-label="Course enrollment details">
      <Card className="sticky top-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold">{course.price}</span>
              {course.originalPrice && course.originalPrice !== course.price && (
                <span className="text-lg text-muted-foreground line-through">{course.originalPrice}</span>
              )}
            </div>
            {course.discount > 0 && (
              <p className="text-sm text-muted-foreground">{`${course.discount}% off for limited time`}</p>
            )}
            {course.limitedTimeOffer?.isActive && countdown && (
              <div className="text-xs px-3 py-2 rounded-md flex items-center justify-center font-NeuMechina mt-4">
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
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default EnrollmentCard