import { useState, type JSX } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react";

// Define interfaces (consistent with SubscriptionPage.tsx)
export interface CheckoutPlan {
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    billing: "monthly" | "yearly";
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: CheckoutPlan | null;
}

interface BillingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface FormData {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
    billingAddress: BillingAddress;
    agreeToTerms: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const RazorpayCheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
    const [currentStep, setCurrentStep] = useState<number>(1); // Changed to 1 for testing inputs
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        email: "",
        firstName: "",
        lastName: "",
        company: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
        billingAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    if (!plan) return null;

    const tax = plan.price * 0.08; // 8% tax
    const total = plan.price + tax;

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!formData.email) newErrors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

            if (!formData.firstName) newErrors.firstName = "First name is required";
            if (!formData.lastName) newErrors.lastName = "Last name is required";
        }

        if (step === 2) {
            if (!formData.cardNumber) newErrors.cardNumber = "Card number is required";
            else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) newErrors.cardNumber = "Invalid card number";

            if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate))
                newErrors.expiryDate = "Invalid expiry date (MM/YY)";

            if (!formData.cvv) newErrors.cvv = "CVV is required";
            else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV";

            if (!formData.cardName) newErrors.cardName = "Cardholder name is required";

            if (!formData.billingAddress.street) newErrors.street = "Street address is required";
            if (!formData.billingAddress.city) newErrors.city = "City is required";
            if (!formData.billingAddress.state) newErrors.state = "State is required";
            if (!formData.billingAddress.zipCode) newErrors.zipCode = "ZIP code is required";
            if (!formData.billingAddress.country) newErrors.country = "Country is required";

            if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        if (typeof value === "boolean") {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        } else if (field.includes(".")) {
            const [parent, child] = field.split(".");
            if (parent === "billingAddress") {
                setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                        ...prev.billingAddress,
                        [child]: value as string, // Cast to string as billingAddress fields are strings
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handlePayment = async () => {
        if (!validateStep(2)) return;

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // In a real app, this would integrate with Razorpay
            console.log("Processing payment with data:", formData);
            console.log("Plan:", plan);

            setPaymentSuccess(true);
            setCurrentStep(3);
        } catch (error) {
            console.error("Payment failed:", error);
            setErrors({ payment: "Payment failed. Please try again." });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value: string): string => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts: string[] = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(" ") : v;
    };

    const renderStep1 = (): JSX.Element => (
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
                            className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} />
                </div>
            </div>
        </div>
    );

    const renderStep2 = (): JSX.Element => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                </h3>

                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                            maxLength={19}
                            className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                                maxLength={5}
                                className={errors.expiryDate ? "border-red-500" : ""}
                            />
                            {errors.expiryDate && <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                                id="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange("cvv", e.target.value)}
                                maxLength={4}
                                className={errors.cvv ? "border-red-500" : ""}
                            />
                            {errors.cvv && <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange("cardName", e.target.value)}
                            className={errors.cardName ? "border-red-500" : ""}
                        />
                        {errors.cardName && <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                            id="street"
                            value={formData.billingAddress.street}
                            onChange={(e) => handleInputChange("billingAddress.street", e.target.value)}
                            className={errors.street ? "border-red-500" : ""}
                        />
                        {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={formData.billingAddress.city}
                                onChange={(e) => handleInputChange("billingAddress.city", e.target.value)}
                                className={errors.city ? "border-red-500" : ""}
                            />
                            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={formData.billingAddress.state}
                                onChange={(e) => handleInputChange("billingAddress.state", e.target.value)}
                                className={errors.state ? "border-red-500" : ""}
                            />
                            {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input
                                id="zipCode"
                                value={formData.billingAddress.zipCode}
                                onChange={(e) => handleInputChange("billingAddress.zipCode", e.target.value)}
                                className={errors.zipCode ? "border-red-500" : ""}
                            />
                            {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                                value={formData.billingAddress.country}
                                onValueChange={(value) => handleInputChange("billingAddress.country", value)}
                            >
                                <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start space-x-2">
                <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    className={errors.agreeToTerms ? "border-red-500" : ""}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-snug">
                        I agree to the Terms of Service and Privacy Policy *
                    </Label>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
                </div>
            </div>

            {errors.payment && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600">{errors.payment}</p>
                </div>
            )}
        </div>
    );

    const renderStep3 = (): JSX.Element => (
        <div className="text-center space-y-6 w-full">
            <div className="flex justify-center items-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground mb-4">Welcome to EduLaunch {plan.name}! Your subscription is now active.</p>
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
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">A confirmation email has been sent to {formData.email}</p>
                <Button onClick={onClose} className="w-full cursor-pointer">
                    Start Learning
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl lg:min-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {paymentSuccess ? "Payment Confirmation" : "Secure Checkout"}
                    </DialogTitle>
                    <DialogDescription>
                        {paymentSuccess
                            ? "Your subscription has been successfully activated"
                            : "Complete your subscription to start learning"}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {!paymentSuccess && (
                            <div className="flex items-center justify-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                    >
                                        1
                                    </div>
                                    <div className={`h-px w-12 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                    >
                                        2
                                    </div>
                                    <div className={`h-px w-12 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                    >
                                        3
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        {!paymentSuccess && (
                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={currentStep === 1 ? onClose : handleBack} disabled={isProcessing}>
                                    {currentStep === 1 ? "Cancel" : "Back"}
                                </Button>

                                {currentStep === 1 && <Button onClick={handleNext}>Continue</Button>}

                                {currentStep === 2 && (
                                    <Button onClick={handlePayment} disabled={isProcessing}>
                                        {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {!paymentSuccess && (
                        <div className="lg:col-span-1">
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
                                            <span>${plan.price.toFixed(2)}</span>
                                        </div>
                                        {plan.originalPrice && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-${(plan.originalPrice - plan.price).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-medium">
                                            <span>Total:</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        <span>Secured by 256-bit SSL encryption</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RazorpayCheckoutModal;