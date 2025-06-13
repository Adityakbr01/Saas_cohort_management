import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData, FormErrors, FormAction } from "./types";
import { debounce } from "lodash";

interface AccountInfoFormProps {
    formData: FormData;
    errors: FormErrors;
    dispatch: React.Dispatch<FormAction>;
    onNext: () => void;
    onClose: () => void
}

const validateStep1 = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) errors.phone = "Phone number must be 10 digits";
    return errors;
};

const AccountInfoForm: React.FC<AccountInfoFormProps> = ({ formData, errors, dispatch, onNext, onClose }) => {
    const handleInputChange = (field: string, value: string) => {
        dispatch({ type: "UPDATE_FORM_DATA", payload: { [field]: value } });
        if (errors[field]) {
            dispatch({ type: "CLEAR_ERROR", payload: field });
        }
    };


    const handleSubmit = () => {
        const validationErrors = validateStep1(formData);
        dispatch({ type: "SET_ERRORS", payload: validationErrors });
        if (Object.keys(validationErrors).length === 0) {
            onNext();
        }
    };

    return (
        <div className="space-y-6 w-full">
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={errors.firstName ? "border-red-600" : ""}
                            placeholder="John"
                            aria-invalid={!!errors.firstName}
                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        />
                        {errors.firstName && (
                            <p id="firstName-error" className="text-sm text-red-600 mt-2">
                                {errors.firstName}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-red-600" : ""}
                            placeholder="Doe"
                            aria-invalid={!!errors.lastName}
                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        />
                        {errors.lastName && (
                            <p id="lastName-error" className="text-sm text-red-600 mt-2">
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-600" : ""}
                        placeholder="example@domain.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-sm text-red-600 mt-2">
                            {errors.email}
                        </p>
                    )}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-600" : ""}
                        maxLength={10}
                        placeholder="1234567890"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                    {errors.phone && (
                        <p id="phone-error" className="text-sm text-red-600 mt-2">
                            {errors.phone}
                        </p>
                    )}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Company Name"
                    />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Button variant={"outline"} onClick={onClose} className="">
                    Cencel
                </Button>
                <Button onClick={handleSubmit} disabled={Object.keys(errors).length > 0}>
                    Continue
                </Button>

            </div>
        </div>
    );
};

export default memo(AccountInfoForm);