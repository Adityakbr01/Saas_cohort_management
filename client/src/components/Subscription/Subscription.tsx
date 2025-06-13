import { Button } from "@/components/ui/button";
import { useGetSubscriptionsPlanQuery } from "@/store/features/api/plans/planApi";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import ErrorBoundary from "./ErrorBoundary";
import { fallbackPlans } from "./fallbackPlans";
import LoadingSkeleton from "./LoadingSkeleton";
import type { CheckoutPlan, SubscriptionPlans } from "./types";
import { createSubscriptionPlans } from "./utils";

const PricingCards = lazy(() => import("./PricingCards"));
const FeaturesComparison = lazy(() => import("./FeaturesComparison"));
const Testimonials = lazy(() => import("./Testimonials"));
const FAQs = lazy(() => import("./FAQs"));
const CTASection = lazy(() => import("./CTASection"));
const CheckOutModel = lazy(() => import("@/components/Subscription/CheckOut/CheckOutModel"));

const SubscriptionPage: React.FC = () => {
  const { data: plansData, isLoading, isError } = useGetSubscriptionsPlanQuery();
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);

  const subscriptionPlans: SubscriptionPlans = plansData?.success && plansData.data
    ? createSubscriptionPlans(plansData.data)
    : fallbackPlans;


    console.log(plansData?.data)

  // Memoize currentPlans to ensure proper recomputation
  const currentPlans = useMemo(
    () => (isYearly ? subscriptionPlans.yearly : subscriptionPlans.monthly),
    [isYearly, subscriptionPlans]
  );

  const handlePlanSelect = (planKey: string) => {
    const plan = currentPlans[planKey as keyof typeof currentPlans];
    setCheckoutPlan({
      name: plan.name,
      price: plan.price,
      originalPrice: plan.originalPrice,
      description: plan.description,
      billing: isYearly ? "yearly" : "monthly",
      planId: plan._id,
      tax: plan.tax
    });

    console.log(checkoutPlan)
    setSelectedPlan(planKey);
    setCheckoutModalOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutModalOpen(false);
    setCheckoutPlan(null);
    setSelectedPlan(null);
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild aria-label="Back to Home">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <ErrorBoundary>
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your <span className="text-primary">Learning Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Unlock your potential with our flexible subscription plans. From individual learners to enterprise teams, we
              have the perfect plan for your learning journey.
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Label
                htmlFor="billing-toggle"
                className={`text-lg ${!isYearly ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}

                className="data-[state=checked]:bg-primary cursor-pointer"
              />
              <Label
                htmlFor="billing-toggle"
                className={`text-lg ${isYearly ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                Yearly
              </Label>

            </div>
          </header>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <div className="text-center py-12 text-red-500">Error loading plans. Using fallback data.</div>
            ) : (
              <PricingCards plans={currentPlans} onPlanSelect={handlePlanSelect} isYearly={isYearly} />
            )}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <FeaturesComparison plans={currentPlans} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <Testimonials />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <FAQs />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <CTASection />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<LoadingSkeleton />}>
          <CheckOutModel isOpen={checkoutModalOpen} onClose={handleCloseCheckout} plan={checkoutPlan} />
        </Suspense>
      </div>
    </div>
  );
};

export default SubscriptionPage;