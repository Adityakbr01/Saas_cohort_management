import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadStripe } from "@stripe/stripe-js";
import { debounce } from "lodash";
import { AlertCircle } from "lucide-react";
import { memo } from "react";
import type {
  CheckoutPlan,
  FormAction,
  FormData,
  FormErrors,
} from "./types";

interface BillingInfoFormProps {
  formData: FormData;
  errors: FormErrors;
  dispatch: React.Dispatch<FormAction>;
  onNext: () => void;
  onBack: () => void;
  plan: CheckoutPlan;
  total: number;
  isProcessing: boolean;
}

const validateStep2 = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  if (!formData.billingAddress.street) errors.street = "Street address is required";
  if (!formData.billingAddress.city) errors.city = "City is required";
  if (!formData.billingAddress.state) errors.state = "State is required";
  if (!formData.billingAddress.zipCode) errors.zipCode = "PIN code is required";
  else if (!/^\d{6}$/.test(formData.billingAddress.zipCode)) errors.zipCode = "PIN code must be 6 digits";
  if (!formData.billingAddress.country) errors.country = "Country is required";
  if (!formData.agreeToTerms) errors.agreeToTerms = "You must agree to the terms and conditions";
  return errors;
};

const debouncedUpdate = debounce(
  (dispatch: React.Dispatch<FormAction>, field: string, value: any) => {
    if (typeof value === "boolean") {
      dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: value } });
    } else if (field.includes("billingAddress")) {
      const [, child] = field.split(".");
      dispatch({ type: "UPDATE_BILLING_ADDRESS", payload: { [child]: value } });
    } else {
      dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: value } });
    }
  },
  300
);

const BillingInfoForm: React.FC<BillingInfoFormProps> = ({
  formData,
  errors,
  dispatch,
  onNext,
  onBack,
  plan,
  total,
  isProcessing,
}) => {
  const handleChange = (field: string, value: any) => {
    if (typeof value === "boolean") {
      dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: value } });
    } else if (field.includes("billingAddress")) {
      const [, child] = field.split(".");
      dispatch({ type: "UPDATE_BILLING_ADDRESS", payload: { [child]: value } });
    } else {
      dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: value } });
    }

    if (errors[field]) {
      dispatch({ type: "CLEAR_ERROR", payload: field });
    }
  };

  const handleBlur = (field: string, value: any) => {
    debouncedUpdate(dispatch, field, value);
  };
   const discountPercentage = plan?.discount ?? 0;

  const discountAmount = plan.price * (discountPercentage / 100);

  const handlePayment = async () => {
    const validationErrors = validateStep2(formData);
    dispatch({ type: "SET_ERRORS", payload: validationErrors });
    if (Object.keys(validationErrors).length > 0) return;

    dispatch({ type: "SET_PROCESSING", payload: true });
    try {
      const stripe = await loadStripe("pk_test_51QZVRzFmcVwSRAFowZJVSN37k5u3IUyBN8m5961COu12oEz8AGzp29bwMpdRwqE4g9jQCtw2NPzVGD09G7Z1dnph00Y8V6sozf");
      const body = {
        plan: {
          currency: "INR",
          amount: total,
          formData,
          plan
        },
      };

      const response = await fetch("http://localhost:3000/api/v1/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const session = await response.json();
      const result = await stripe?.redirectToCheckout({ sessionId: session.id });

      if (result?.error) {
        dispatch({ type: "SET_ERRORS", payload: { payment: result.error.message! } });
      } else {
        dispatch({ type: "SET_PAYMENT_SUCCESS", payload: true });
        onNext();
      }
    } catch {
      dispatch({
        type: "SET_ERRORS",
        payload: { payment: "Payment failed. Please try again." },
      });
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {[
        { id: "street", label: "Street Address *" },
        { id: "city", label: "City *" },
        { id: "state", label: "State *" },
        { id: "zipCode", label: "PIN Code *", maxLength: 6 },
      ].map(({ id, label, maxLength }) => (
        <div key={id} className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            value={(formData.billingAddress as any)[id]}
            onChange={(e) => handleChange(`billingAddress.${id}`, e.target.value)}
            onBlur={(e) => handleBlur(`billingAddress.${id}`, e.target.value)}
            className={errors[id] ? "border-red-600" : ""}
            maxLength={maxLength}
          />
          {errors[id] && <p className="text-sm text-red-600">{errors[id]}</p>}
        </div>
      ))}

      {/* Country Select */}
      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select
          value={formData.billingAddress.country}
          onValueChange={(value) => handleChange("billingAddress.country", value)}
        >
          <SelectTrigger className={errors.country ? "border-red-600" : ""}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
          </SelectContent>
        </Select>
        {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={(value) => handleChange("agreeToTerms", value)}
        />
        <Label htmlFor="agreeToTerms" className="text-sm">
          I agree to terms and conditions
        </Label>
      </div>
      {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

      {/* Errors & Loader */}
      {isProcessing && <p className="text-sm text-blue-600">Processing payment...</p>}
      {errors.payment && (
        <div className="text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {errors.payment}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? "Processing..." : `Pay ₹${Math.round(total-discountAmount)}`}
        </Button>
      </div>
    </div>
  );
};

export default memo(BillingInfoForm);