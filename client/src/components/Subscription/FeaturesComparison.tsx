import { memo } from "react";
import { Check, X } from "lucide-react";
import { type SubscriptionPlans } from "./types";

interface FeaturesComparisonProps {
  plans: SubscriptionPlans["monthly"];
}

const FeaturesComparison: React.FC<FeaturesComparisonProps> = ({ plans }) => {
  return (
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
            {plans.basic.features.map((_, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-4">{plans.basic.features[index]?.name || "N/A"}</td>
                <td className="text-center p-4">
                  {plans.basic.features[index]?.included ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" aria-hidden="true" />
                  )}
                </td>
                <td className="text-center p-4">
                  {plans.pro.features[index]?.included ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" aria-hidden="true" />
                  )}
                </td>
                <td className="text-center p-4">
                  {plans.business.features[index]?.included ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" aria-hidden="true" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(FeaturesComparison);