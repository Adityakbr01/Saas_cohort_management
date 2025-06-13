import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import type{  CheckoutPlan, FormData } from "./types";

interface PaymentConfirmationProps {
  formData: FormData;
  plan: CheckoutPlan;
  total: number;
  onClose: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ formData, plan, total, onClose }) => {
  return (
    <div className="text-center space-y-6 w-full">
      <div className="flex justify-center items-center">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-green-600 mb-4">Payment Successful!</h3>
        <p className="text-muted-foreground text-base">
          Welcome to EduLaunch {plan.name}! Your subscription is now active.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-medium">{plan.billing === "yearly" ? "Yearly" : "Monthly"}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total Paid:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to {formData.email}
        </p>
        <Button onClick={onClose} className="w-full">
          Start Learning
        </Button>
      </div>
    </div>
  );
};

export default memo(PaymentConfirmation);