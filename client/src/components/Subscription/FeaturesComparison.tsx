import { memo } from "react";
import { Check, X } from "lucide-react";
import { type SubscriptionPlans } from "./types";

interface FeaturesComparisonProps {
  plans: SubscriptionPlans["monthly"];
}

const FeaturesComparison: React.FC<FeaturesComparisonProps> = ({ plans }) => {
  const basic = plans?.basic;
  const pro = plans?.pro;
  const business = plans?.business;

  if (!basic || !pro || !business) return null;

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
            {basic.features.map((feature, index) => {
              if (feature.name === "N/A") return null;

              return (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-4">{feature.name}</td>
                  <td className="text-center p-4">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-4">
                    {pro.features[index]?.included ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-4">
                    {business.features[index]?.included ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(FeaturesComparison);
