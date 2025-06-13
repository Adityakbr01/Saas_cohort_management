import { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import {type  CheckoutPlan } from "./types";

interface OrderSummaryProps {
  plan: CheckoutPlan;
  tax: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ plan, tax, total }) => {
  const discountPercentage = plan?.discount ?? 0;
  const discountAmount = plan.price * (discountPercentage / 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium">{plan.name} Plan</h4>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <Badge variant="outline" className="mt-2">
            {plan.billing === "yearly" ? "Yearly" : "Monthly"} Billing
          </Badge>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{plan.price.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountPercentage}%):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>GST ({plan.tax}%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>

          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>₹{Math.round(total-discountAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secured by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
};


export default memo(OrderSummary);