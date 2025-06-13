import { memo } from "react";
import { Check } from "lucide-react"; // Optional: Add a checkmark icon for completed steps

interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [1, 2, 3];

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-10 animate-fade-in">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center space-x-4">
            {/* Step circle */}
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors duration-500 
                ${
                  currentStep >= step
                    ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-600"
                }
              `}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </div>

            {/* Connector line (except after last step) */}
            {index !== steps.length - 1 && (
              <div
                className={`h-1 w-10 transition-all duration-500 rounded-full ${
                  currentStep > step
                    ? "bg-gradient-to-r from-blue-400 to-violet-500"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(CheckoutSteps);
