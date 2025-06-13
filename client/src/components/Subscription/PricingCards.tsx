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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {Object.entries(plans).map(([key, plan]) => {
        const Icon = plan.icon;
        const isPopular = plan.popular;

        return (
          <Card
            key={key}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              isPopular ? "border-primary shadow-lg scale-105" : "hover:scale-105"
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
              <p className="text-center text-sm text-muted-foreground mt-3">7-day free trial • Cancel anytime</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(PricingCards);