import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, X } from "lucide-react";
import { type Plan } from "./types";

interface PricingCardsProps {
  plans: { [key: string]: Plan };
  onPlanSelect: (planKey: string) => void;
  isYearly: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({ plans, onPlanSelect, isYearly }) => {
  if (!plans || Object.keys(plans).length === 0) {
    return <div className="text-center text-muted-foreground">No plans available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {Object.entries(plans).map(([key, plan]) => {
        if (!plan) return null;

        console.log({
          planKey: key,
          isYearly,
          originalPrice: plan.originalPrice,
          price: plan.price,
          yearlyPrice: plan.yearlyPrice,
          discount: plan.discount,
          calculatedDiscount: plan.originalPrice && plan.originalPrice - plan.price,
        });

        const Icon = plan.icon;
        const isPopular = plan.popular;

        // Use API discount if available, else calculate
        const hasDiscount = isYearly && (plan.discount > 0 || (plan.originalPrice && plan.originalPrice > plan.yearlyPrice));
        const discountPercent = plan.discount > 0 ? plan.discount : plan.originalPrice && plan.yearlyPrice < plan.originalPrice ? Math.round(((plan.originalPrice - plan.yearlyPrice) / plan.originalPrice) * 100) : 0;
        const discountAmount = plan.originalPrice && discountPercent > 0 ? Math.round((plan.originalPrice * discountPercent) / 100) : 0;

        // Use yearlyPrice for yearly mode, price for monthly mode
        const displayPrice = isYearly ? plan.yearlyPrice - discountAmount : plan.price;

        return (
          <Card
            key={key}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${isPopular ? "border-primary shadow-lg scale-105" : "hover:scale-105"
              }`}
            aria-label={`${plan.name} plan card`}
          >
            {isPopular && (
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                <Sparkles className="inline h-4 w-4 mr-1" aria-hidden="true" />
                Most Popular
              </div>
            )}
            <CardHeader className={`text-center ${isPopular ? "pt-12" : "pt-6"}`}>
              <div className={`w-16 h-16 rounded-full ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>

              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">₹{displayPrice.toLocaleString()}</span>
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">/{isYearly ? "year" : "month"}</div>
                  </div>
                </div>

                {hasDiscount && (
                  <>
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">₹{plan.originalPrice?.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      Save ₹{discountAmount.toLocaleString()} ({discountPercent}% off)
                    </p>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
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
                onClick={() => onPlanSelect(key)}
                aria-label={`Choose ${plan.name} plan`}
              >
                Choose Plan
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                7-day free trial • Cancel anytime
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(PricingCards);