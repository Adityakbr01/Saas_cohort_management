import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreate_checkout_session_cohortMutation } from "@/store/features/api/payment/payment";
import { selectCurrentUser } from "@/store/features/slice/UserAuthSlice";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import { useSelector } from "react-redux";

type Course = {
  price: string;
  originalPrice: string;
  discount: number;
  limitedTimeOffer?: { isActive: boolean; endDate?: string };
  duration: string;
  level: string;
  language: string;
  certificate: boolean;
  id: string;
  title: string;
  description:string
};

const stripePromise = loadStripe(
  "pk_test_51QZVRzFmcVwSRAFowZJVSN37k5u3IUyBN8m5961COu12oEz8AGzp29bwMpdRwqE4g9jQCtw2NPzVGD09G7Z1dnph00Y8V6sozf"
);

function EnrollmentCard({
  course,
  countdown,
  isUpcoming,
  launchCountdown,
  bookmarked,
  toggleBookmark,
  refetch,
}: {
  course: Course;
  countdown?: string;
  isUpcoming?: boolean;
  launchCountdown?: string;
  bookmarked: boolean;
  toggleBookmark: () => void;
  refetch: () => void;
}) {

  const user = useSelector(selectCurrentUser);
  const [createCheckoutSession, { isLoading }] = useCreate_checkout_session_cohortMutation();

  console.log(user)

  const formData = useMemo(
    () => ({
      email: user?.email,
      firstName: user?.name,
      phone:user?.phone || "1234567890",
      agreeToTerms: true,
      billingAddress: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        country: "IN",
      },
    }),
    [user?.email, user?.name, user?.phone]
  );

  const handleEnroll = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      const total = parseFloat(course.price) * 100; // Stripe expects amount in paisa

      const response = await createCheckoutSession({
        cohortId: course.id,
        userId: user?._id,
        currency: "INR",
        formData,
        amount: total,
        plan: {
          name: course.title,
          description: course.description,
        },
      }).unwrap();
      console.log(response)

      if (response?.id) {
        const result = await stripe.redirectToCheckout({ sessionId: response.id });
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        throw new Error("Failed to create checkout session.");
      }
      refetch();
    } catch (err) {
      console.log(err)
      console.error("❌ Stripe Checkout Error:", err);
      alert("Something went wrong during enrollment.");
    }
  };

  return (
    <aside className="lg:col-span-1" aria-label="Course enrollment details">
      <Card className="sticky top-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold">{course.price}</span>
              {course.originalPrice !== course.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {course.originalPrice}
                </span>
              )}
            </div>

            {course.discount > 0 && (
              <p className="text-sm text-muted-foreground">
                {`${course.discount}% off for limited time`}
              </p>
            )}

            {isUpcoming && (
              <div className="text-sm text-yellow-600">
                🚀 Course Launching In: {launchCountdown}
              </div>
            )}

            {!isUpcoming &&
              course.limitedTimeOffer?.isActive &&
              countdown && (
                <div className="text-xs px-3 py-2 rounded-md flex items-center justify-center mt-4">
                  <span className="font-medium">
                    🔥 Limited Offer Ends In:{" "}
                  </span>
                  <span className="ml-2">{countdown}</span>
                </div>
              )}
          </div>

          {/* Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              className="w-full hover:scale-101 transition-transform focus:ring-2 focus:ring-primary"
              size="lg"
              disabled={isUpcoming || isLoading}
              onClick={handleEnroll}
            >
              {isUpcoming ? "🚀 Launching Soon" : "Enroll Now"}
            </Button>

            <Button
              variant="outline"
              className="w-full hover:scale-101 transition-transform focus:ring-2 focus:ring-primary"
              onClick={toggleBookmark}
            >
              {bookmarked ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{course.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level:</span>
              <span>{course.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <span>{course.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certificate:</span>
              <span>{course.certificate ? "Yes" : "No"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default EnrollmentCard;
