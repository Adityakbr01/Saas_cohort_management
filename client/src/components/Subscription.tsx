import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Star, BookOpen, Building2, Sparkles, type LucideIcon } from "lucide-react";
import RazorpayCheckoutModal from "@/components/razorpay-checkout-modal";
import { useGetSubscriptionsPlanQuery } from "@/store/features/api/plans/planApi";

// Define interfaces for data structures
interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  icon: LucideIcon;
  color: string;
  popular: boolean;
  features: Feature[];
  _id:string
}

interface SubscriptionPlans {
  monthly: {
    basic: Plan;
    pro: Plan;
    business: Plan;
  };
  yearly: {
    basic: Plan;
    pro: Plan;
    business: Plan;
  };
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  plan: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface CheckoutPlan {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  billing: "monthly" | "yearly";
  planId:string
}

// Interface for API response
interface ApiPlan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  subscribers: string[];
  Owner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Function to transform API data into SubscriptionPlans
const createSubscriptionPlans = (apiPlans: ApiPlan[]): SubscriptionPlans => {
  const planMap: { [key: string]: Plan } = {};
  
  // Map icons and colors
  const iconMap: { [key: string]: LucideIcon } = {
    basic: BookOpen,
    pro: Star,
    business: Building2,
  };
  const colorMap: { [key: string]: string } = {
    basic: "bg-blue-500",
    pro: "bg-purple-500",
    business: "bg-green-500",
  };

  // Process monthly plans
  apiPlans.forEach((apiPlan) => {
    const normalizedName = apiPlan.name.toLowerCase();
    planMap[normalizedName] = {
      name: apiPlan.name.charAt(0).toUpperCase() + apiPlan.name.slice(1), // Capitalize name
      price: apiPlan.price,
      description: apiPlan.description,
      icon: iconMap[normalizedName] || BookOpen,
      color: colorMap[normalizedName] || "bg-blue-500",
      popular: apiPlan.popular,
      features: apiPlan.features.map((feature) => ({
        name: feature,
        included: true,
      })),
      _id:apiPlan._id
    };
  });

  // Generate yearly plans (17% discount)
  const yearlyPlans: { [key: string]: Plan } = {};
  Object.entries(planMap).forEach(([key, plan]) => {
    const yearlyPrice = Math.round(plan.price * 12 * 0.83); // 17% discount
    const originalPrice = plan.price * 12;
    yearlyPlans[key] = {
      ...plan,
      price: yearlyPrice,
      originalPrice,
    };
  });

  return {
    monthly: {
      basic: planMap.basic,
      pro: planMap.pro,
      business: planMap.business,
    },
    yearly: {
      basic: yearlyPlans.basic,
      pro: yearlyPlans.pro,
      business: yearlyPlans.business,
    },
  };
};

// Hardcoded fallback plans (in case API fails)
const fallbackPlans: SubscriptionPlans = {
  monthly: {
    basic: {
      name: "Basic",
      price: 0,
      description: "Ideal for individuals or trial users getting started.",
      icon: BookOpen,
      color: "bg-blue-500",
      popular: false,
      features: [
        { name: "Access to 2 cohort", included: true },
        { name: "Max 10 students per cohort", included: true },
        { name: "Basic student management", included: true },
        { name: "Limited analytics dashboard", included: true },
        { name: "Email support only", included: true },
      ],
      _id:"123"
    },
    pro: {
      name: "Pro",
      price: 1999,
      description: "Perfect for small coaching centers managing multiple cohorts.",
      icon: Star,
      color: "bg-purple-500",
      popular: true,
      features: [
        { name: "Access to 5 cohorts", included: true },
        { name: "Up to 100 students per cohort", included: true },
        { name: "Assignments and attendance management", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Email + chat support", included: true },
      ],
        _id:"123"
    },
    business: {
      name: "Business",
      price: 4999,
      description: "Best for large institutions with complete control and support.",
      icon: Building2,
      color: "bg-green-500",
      popular: false,
      features: [
        { name: "Unlimited cohorts", included: true },
        { name: "Unlimited students per cohort", included: true },
        { name: "Full-featured student & teacher dashboards", included: true },
        { name: "Custom branding & domain", included: true },
        { name: "Priority 24/7 support", included: true },
      ],
        _id:"123"
    },
  },
  yearly: {
    basic: {
      name: "Basic",
      price: 0,
      description: "Ideal for individuals or trial users getting started.",
      icon: BookOpen,
      color: "bg-blue-500",
      popular: false,
      features: [
        { name: "Access to 2 cohort", included: true },
        { name: "Max 10 students per cohort", included: true },
        { name: "Basic student management", included: true },
        { name: "Limited analytics dashboard", included: true },
        { name: "Email support only", included: true },
      ],
        _id:"123"
    },
    pro: {
      name: "Pro",
      price: 19940, // 1999 * 12 * 0.83
      originalPrice: 23988, // 1999 * 12
      description: "Perfect for small coaching centers managing multiple cohorts.",
      icon: Star,
      color: "bg-purple-500",
      popular: true,
      features: [
        { name: "Access to 5 cohorts", included: true },
        { name: "Up to 100 students per cohort", included: true },
        { name: "Assignments and attendance management", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Email + chat support", included: true },
      ],
        _id:"123"
    },
    business: {
      name: "Business",
      price: 49850, // 4999 * 12 * 0.83
      originalPrice: 59988, // 4999 * 12
      description: "Best for large institutions with complete control and support.",
      icon: Building2,
      color: "bg-green-500",
      popular: false,
      features: [
        { name: "Unlimited cohorts", included: true },
        { name: "Unlimited students per cohort", included: true },
        { name: "Full-featured student & teacher dashboards", included: true },
        { name: "Custom branding & domain", included: true },
        { name: "Priority 24/7 support", included: true },
      ],
        _id:"123"
    },
  },
};

// Testimonials (unchanged)
const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    company: "TechCorp",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The Pro plan has been incredible for my career growth. The certificates and live sessions are worth every penny.",
    rating: 5,
    plan: "Pro",
  },
  {
    name: "Michael Chen",
    role: "Learning Manager",
    company: "InnovateCo",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Our team of 30 developers loves the Business plan. The analytics help us track everyone's progress effectively.",
    rating: 5,
    plan: "Business",
  },
  {
    name: "Emily Davis",
    role: "Marketing Specialist",
    company: "StartupXYZ",
    avatar: "/placeholder.svg?height=60&width=60",
    content: "Started with Basic and it's perfect for learning new skills. Great value for money!",
    rating: 5,
    plan: "Basic",
  },
];

// FAQs (unchanged)
const faqs: FAQ[] = [
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "Is there a free trial available?",
    answer: "We offer a 7-day free trial for all plans. No credit card required to start your trial.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "You'll continue to have access to your plan features until the end of your current billing period. After that, you'll be moved to our free tier with limited access.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Yes! Students can get 50% off any plan with a valid student email address. Contact our support team for more details.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for all plans. If you're not satisfied, contact us for a full refund.",
  },
];

const SubscriptionPage: React.FC = () => {
  const { data: plansData, isLoading, isError } = useGetSubscriptionsPlanQuery();

  console.log(plansData);

  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);

  // Use API data if available, otherwise fallback
  const subscriptionPlans = plansData?.success && plansData.data
    ? createSubscriptionPlans(plansData.data)
    : fallbackPlans;

  const currentPlans = isYearly ? subscriptionPlans.yearly : subscriptionPlans.monthly;

  const handlePlanSelect = (planKey: string) => {
    const plan = currentPlans[planKey as keyof typeof currentPlans];
    setCheckoutPlan({
      name: plan.name,
      price: plan.price,
      originalPrice: plan.originalPrice,
      description: plan.description,
      billing: isYearly ? "yearly" : "monthly",
      planId:plan._id
    });
    setSelectedPlan(planKey);
    setCheckoutModalOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutModalOpen(false);
    setCheckoutPlan(null);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading plans...</div>;
  }

  if (isError) {
    return <div className="text-center py-12 text-red-500">Error loading plans. Using fallback data.</div>;
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your <span className="text-primary">Learning Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Unlock your potential with our flexible subscription plans. From individual learners to enterprise teams, we
            have the perfect plan for your learning journey.
          </p>

          {/* Billing Toggle */}
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
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="billing-toggle"
              className={`text-lg ${isYearly ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              Yearly
            </Label>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Save 17%
              </Badge>
            )}
          </div>

          {/* Payment Methods Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium mb-2">Secure Payment with Razorpay</p>
            <p className="text-sm text-blue-700">
              Pay securely using UPI, Credit/Debit Cards, Net Banking, or Digital Wallets. All transactions are
              protected with bank-level security.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(currentPlans).map(([key, plan]) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <Card
                key={key}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular ? "border-primary shadow-lg scale-105" : "hover:scale-105"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                )}

                <CardHeader className={`text-center ${isPopular ? "pt-12" : "pt-6"}`}>
                  <div className={`w-16 h-16 rounded-full ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>

                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                      <div className="text-left">
                        <div className="text-sm text-muted-foreground">/{isYearly ? "year" : "month"}</div>
                      </div>
                    </div>
                    {isYearly && plan.originalPrice && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">₹{plan.originalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {isYearly && plan.price > 0 && <p className="text-sm text-green-600 mt-2">2 months free!</p>}
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-6 pt-0">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(key)}
                  >
                    Choose Plan
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-3">7-day free trial • Cancel anytime</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Compare All Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Features</th>
                  <th className="text-center p-4 font-medium">Basic</th>
                  <th className="text-center p-4 font-medium">Pro</th>
                  <th className="text-center p-4 font-medium">Business</th>
                </tr>
              </thead>
              <tbody>
                {currentPlans.basic.features.map((_, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4">{currentPlans.basic.features[index]?.name || "N/A"}</td>
                    <td className="text-center p-4">
                      {currentPlans.basic.features[index]?.included ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {currentPlans.pro.features[index]?.included ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {currentPlans.business.features[index]?.included ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Subscribers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-3">"{testimonial.content}"</p>
                  <Badge variant="outline">{testimonial.plan} Plan</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already advancing their careers with EduLaunch. Start your free trial
            today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal isOpen={checkoutModalOpen} onClose={handleCloseCheckout} plan={checkoutPlan} />
    </div>
  );
};

export default SubscriptionPage;