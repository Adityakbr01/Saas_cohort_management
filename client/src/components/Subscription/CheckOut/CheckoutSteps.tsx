import { memo } from "react";

interface CheckoutStepsProps {
  currentStep: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
            currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200"
          }`}
        >
          1
        </div>
        <div className={`h-px w-8 ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
            currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200"
          }`}
        >
          2
        </div>
        <div className={`h-px w-8 ${currentStep >= 3 ? "bg-primary" : "bg-gray-200"}`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
            currentStep >= 3 ? "bg-primary text-white" : "bg-gray-200"
          }`}
        >
          3
        </div>
      </div>
    </div>
  );
};

export default memo(CheckoutSteps);