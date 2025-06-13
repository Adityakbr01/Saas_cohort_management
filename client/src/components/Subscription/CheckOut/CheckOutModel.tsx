import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { lazy, Suspense, useCallback, useReducer } from "react";
import CheckoutSteps from "./CheckoutSteps";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSkeleton from "./LoadingSkeleton";
import OrderSummary from "./OrderSummary";
import type { CheckoutPlan, FormAction, FormState } from "./types";

// Lazy load form components
const AccountInfoForm = lazy(() => import("./AccountInfoForm"));
const BillingInfoForm = lazy(() => import("./BillingInfoForm"));
const PaymentConfirmation = lazy(() => import("./PaymentConfirmation"));

// Form reducer for centralized state management
const initialFormState: FormState = {
  currentStep: 1,
  isProcessing: false,
  paymentSuccess: false,
  formData: {
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "IN",
    },
    agreeToTerms: false,
  },
  errors: {},
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_PAYMENT_SUCCESS":
      return { ...state, paymentSuccess: action.payload };
    case "UPDATE_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case "UPDATE_BILLING_ADDRESS":
      return {
        ...state,
        formData: {
          ...state.formData,
          billingAddress: { ...state.formData.billingAddress, ...action.payload },
        },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "CLEAR_ERROR":
      return { ...state, errors: { ...state.errors, [action.payload]: "" } };
    default:
      return state;
  }
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CheckoutPlan | null;
}

const CheckOutModel: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  // Move useCallback hooks before any early return to maintain consistent hook order
  const handleNext = useCallback(() => {
    dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
  }, [state.currentStep]);

  const handleBack = useCallback(() => {
    dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
  }, [state.currentStep]);

  if (!plan) {
    return null;
  }


  // Calculate tax and total
const tax = plan.price * (plan.tax / 100);
const total = Math.round(plan.price + tax);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl min-w-3xl max-h-[90vh] overflow-y-auto z-[1000]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-700" />
            {state.paymentSuccess ? "Payment Confirmation" : "Secure Checkout"}
          </DialogTitle>
          <DialogDescription>
            {state.paymentSuccess
              ? "Your subscription has been successfully activated"
              : "Complete your payment to start learning"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {!state.paymentSuccess && (
              <ErrorBoundary>
                <CheckoutSteps currentStep={state.currentStep} />
              </ErrorBoundary>
            )}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                {state.currentStep === 1 && (
                  <AccountInfoForm
                    formData={state.formData}
                    errors={state.errors}
                    dispatch={dispatch}
                    onNext={handleNext}
                    onClose={onClose}
                  />
                )}
                {state.currentStep === 2 && (
                  <BillingInfoForm
                    formData={state.formData}
                    errors={state.errors}
                    dispatch={dispatch}
                    onNext={handleNext}
                    onBack={handleBack}
                    plan={plan}
                    total={total}
                    isProcessing={state.isProcessing}
                  />
                )}
                {state.currentStep === 3 && (
                  <PaymentConfirmation formData={state.formData} plan={plan} total={total} onClose={onClose} />
                )}
              </Suspense>
            </ErrorBoundary>
        
          </div>
          {!state.paymentSuccess && (
            <ErrorBoundary>
              <OrderSummary plan={plan} tax={tax} total={total} />
            </ErrorBoundary>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckOutModel;