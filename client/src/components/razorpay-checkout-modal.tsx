
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
import { Lock, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from "@/store/features/api/payment/payment";

// Define interfaces
export interface CheckoutPlan {
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    billing: "monthly" | "yearly";
    planId: string;
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
    phone: string; // Added for Razorpay prefill
    billingAddress: BillingAddress;
    agreeToTerms: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const RazorpayCheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
    const [initiatePayment, { isLoading: isInitiating, isError: initiateError, error: initiateErrorData }] = useInitiatePaymentMutation();
    const [verifyPayment, { isLoading: isVerifying, isError: verifyError, error: verifyErrorData }] = useVerifyPaymentMutation();

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
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
            country: "IN", // Default to India
        },
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // Load Razorpay SDK dynamically
    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            if ((window as any).Razorpay) {
                console.debug("[Razorpay] SDK already loaded");
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => {
                console.debug("[Razorpay] SDK loaded successfully");
                resolve(true);
            };
            script.onerror = () => {
                console.error("[Razorpay] Failed to load SDK");
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    if (!plan) {
        console.debug("[Razorpay] No plan selected, rendering null");
        return null;
    }

    console.debug("[Razorpay] Selected Plan:", JSON.stringify(plan, null, 2));

    // Calculate tax and total in INR
    const tax = plan.price * 0.18; // 18% GST
    const total = plan.price + tax;

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!formData.email) newErrors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
            if (!formData.firstName) newErrors.firstName = "First name is required";
            if (!formData.lastName) newErrors.lastName = "Last name is required";
            if (!formData.phone) newErrors.phone = "Phone number is required";
            else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number (10 digits)";
        }

        if (step === 2) {
            if (!formData.billingAddress.street) newErrors.street = "Street address is required";
            if (!formData.billingAddress.city) newErrors.city = "City is required";
            if (!formData.billingAddress.state) newErrors.state = "State is required";
            if (!formData.billingAddress.zipCode) newErrors.zipCode = "PIN code is required";
            else if (!/^\d{6}$/.test(formData.billingAddress.zipCode)) newErrors.zipCode = "Invalid PIN code (6 digits)";
            if (!formData.billingAddress.country) newErrors.country = "Country is required";
            if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";
        }

        setErrors(newErrors);
        console.debug("[Razorpay] Validation Errors (Step", step, "):", JSON.stringify(newErrors, null, 2));
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        console.debug("[Razorpay] Input Change:", { field, value });
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
                        [child]: value as string,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            console.debug("[Razorpay] Advancing to Step", currentStep + 1);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        console.debug("[Razorpay] Going back to Step", currentStep - 1);
        setCurrentStep(currentStep - 1);
    };

    const handlePayment = async () => {
        if (!validateStep(2)) {
            console.debug("[Razorpay] Validation failed for Step 2");
            return;
        }

        // Skip payment for free plans
        if (total === 0) {
            console.debug("[Razorpay] Free plan selected, skipping payment");
            setPaymentSuccess(true);
            setCurrentStep(3);
            return;
        }

        setIsProcessing(true);
        console.debug("[Razorpay] Initiating payment process");

        try {
            // Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load Razorpay SDK");
            }

            // Check if Razorpay is available
            if (!(window as any).Razorpay) {
                throw new Error("Razorpay SDK not available after loading");
            }

            // Initiate Razorpay order
            console.debug("[Razorpay] Sending initiatePayment request", {
                subscriptionId: plan.planId,
                amount: Math.round(total * 100),
                currency: "INR",
            });
            const paymentResponse = await initiatePayment({
                subscriptionId: plan.planId,
                amount: Math.round(total * 100),
                currency: "INR",

            }).unwrap();

            console.debug("[Razorpay] Initiate Payment Response:", JSON.stringify(paymentResponse, null, 2));
            if (!paymentResponse.success || !paymentResponse.data?.id) {
                throw new Error(paymentResponse.message || "Failed to create Razorpay order");
            }

            // Razorpay checkout options
            const options = {
                key: "rzp_test_Td92zeWQG08N6d",
                amount: Math.round(total * 100), // Amount in paise
                currency: "INR",
                name: "EduLaunch",
                description: `${plan.name} Plan Subscription (${plan.billing})`,
                order_id: paymentResponse.data.id,
                image: "https://your-logo-url.com/logo.png", // Replace with your logo URL
                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    console.debug("[Razorpay] Payment Response:", JSON.stringify(response, null, 2));
                    if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
                        console.error("[Razorpay] Incomplete payment response");
                        setErrors({ payment: "Payment incomplete. Please try again." });
                        return;
                    }
                    try {
                        console.debug("[Razorpay] Sending verifyPayment request", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            subscriptionId: plan.planId,
                        });
                        const verifyResponse = await verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            subscriptionId: plan.planId,
                        }).unwrap();

                        console.debug("[Razorpay] Verify Payment Response:", JSON.stringify(verifyResponse, null, 2));

                        if (verifyResponse.success) {
                            setPaymentSuccess(true);
                            setCurrentStep(3);
                        } else {
                            throw new Error(verifyResponse.message || "Payment verification failed");
                        }
                    } catch (error: any) {
                        console.error("[Razorpay] Verification Error:", error);
                        setErrors({ payment: error.message || "Payment verification failed. Please try again." });
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    subscriptionId: plan.planId,
                    billing_address: `${formData.billingAddress.street}, ${formData.billingAddress.city}, ${formData.billingAddress.state}, ${formData.billingAddress.zipCode}, ${formData.billingAddress.country}`,
                },
                theme: {
                    color: "#3399cc",
                },
                modal: {
                    ondismiss: () => {
                        console.debug("[Razorpay] Modal dismissed by user");
                        setIsProcessing(false);
                        setErrors({ payment: "Payment cancelled. Please try again." });
                    },
                },
                config: {
                    display: {
                        blocks: {
                            banks: {
                                name: "Pay via",
                                instruments: [
                                    { method: "card" },
                                    { method: "upi" },
                                    { method: "netbanking" },
                                    { method: "wallet" },
                                ],
                            },
                        },
                        sequence: ["block.banks"],
                        preferences: {
                            show_default_blocks: true,
                        },
                    },
                },
            };

            console.debug("[Razorpay] Checkout Options:", JSON.stringify(options, null, 2));

            // Open Razorpay checkout
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
            console.debug("[Razorpay] Checkout modal opened");

            // Ensure modal is interactive
            setTimeout(() => {
                const razorpayModal = document.querySelector(".razorpay-container");
                if (razorpayModal) {
                    console.debug("[Razorpay] Setting modal z-index and focus");
                    (razorpayModal as HTMLElement).style.zIndex = "10000";
                    (razorpayModal as HTMLElement).focus();
                } else {
                    console.warn("[Razorpay] Modal element not found");
                }
            }, 500);

            razorpay.on("payment.failed", (error: any) => {
                console.error("[Razorpay] Payment Failed:", JSON.stringify(error, null, 2));
                setErrors({
                    payment: error.error?.description || "Payment failed. Please try again.",
                });
                setIsProcessing(false);
            });
        } catch (error: any) {
            console.error("[Razorpay] Payment Initiation Failed:", error);
            setErrors({
                payment: error.message || "Failed to initiate payment. Please try again.",
            });
        } finally {
            setIsProcessing(false);
            console.debug("[Razorpay] Payment processing completed");
        }
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
                            className={errors.firstName ? "border-red-600" : ""}
                            placeholder="John"
                        />
                        {errors.firstName && <p className="text-sm text-red-600 mt-2">{errors.firstName}</p>}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-red-600" : ""}
                            placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-sm text-red-600 mt-2">{errors.lastName}</p>}
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
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-2">{errors.email}</p>}
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
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-2">{errors.phone}</p>}
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
        </div>
    );

    const renderStep2 = (): JSX.Element => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Billing Information
                </h3>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                            id="street"
                            value={formData.billingAddress.street}
                            onChange={(e) => handleInputChange("billingAddress.street", e.target.value)}
                            className={errors.street ? "border-red-600" : ""}
                            placeholder="123 Main St"
                        />
                        {errors.street && <p className="text-sm text-red-600 mt-2">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={formData.billingAddress.city}
                                onChange={(e) => handleInputChange("billingAddress.city", e.target.value)}
                                className={errors.city ? "border-red-600" : ""}
                                placeholder="City"
                            />
                            {errors.city && <p className="text-sm text-red-600 mt-2">{errors.city}</p>}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={formData.billingAddress.state}
                                onChange={(e) => handleInputChange("billingAddress.state", e.target.value)}
                                className={errors.state ? "border-red-600" : ""}
                                placeholder="State"
                            />
                            {errors.state && <p className="text-sm text-red-600 mt-2">{errors.state}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="zipCode">PIN Code *</Label>
                            <Input
                                id="zipCode"
                                value={formData.billingAddress.zipCode}
                                onChange={(e) => handleInputChange("billingAddress.zipCode", e.target.value)}
                                className={errors.zipCode ? "border-red-600" : ""}
                                maxLength={6}
                                placeholder="123456"
                            />
                            {errors.zipCode && <p className="text-sm text-red-600 mt-2">{errors.zipCode}</p>}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                                value={formData.billingAddress.country}
                                onValueChange={(value) => handleInputChange("billingAddress.country", value)}
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
                            {errors.country && <p className="text-sm text-red-600 mt-2">{errors.country}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-start space-x-2">
                <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    className={errors.agreeToTerms ? "border-red-600" : ""}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agreeToTerms" className="text-sm font-medium text-muted-foreground">
                        I agree to the Terms of Service and Privacy Policy *
                    </Label>
                    {errors.agreeToTerms && <p className="text-sm text-red-600 mt-2">{errors.agreeToTerms}</p>}
                </div>
            </div>
            {errors.payment && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-700 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-700" />
                    <p className="text-sm text-red-700">{errors.payment}</p>
                </div>
            )}
        </div>
    );

    const renderStep3 = (): JSX.Element => (
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl min-w-3xl max-h-[90vh] overflow-y-auto z-[1000]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gray-700" />
                        {paymentSuccess ? "Payment Confirmation" : "Secure Checkout"}
                    </DialogTitle>
                    <DialogDescription>
                        {paymentSuccess
                            ? "Your subscription has been successfully activated"
                            : "Complete your payment to start learning"}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        {!paymentSuccess && (
                            <div className="flex items-center justify-center mb-6">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200"
                                            }`}
                                    >
                                        1
                                    </div>
                                    <div
                                        className={`h-px w-8 ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}
                                    />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200"
                                            }`}
                                    >
                                        2
                                    </div>
                                    <div
                                        className={`h-px w-8 ${currentStep >= 3 ? "bg-primary" : "bg-gray-200"}`}
                                    />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${currentStep >= 3 ? "bg-primary text-white" : "bg-gray-200"
                                            }`}
                                    >
                                        3
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        <div className="flex justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={currentStep === 1 ? onClose : handleBack}
                                disabled={isProcessing || isInitiating || isVerifying}
                            >
                                {currentStep === 1 ? "Cancel" : "Back"}
                            </Button>
                            {currentStep === 1 && (
                                <Button
                                    onClick={handleNext}
                                    disabled={isProcessing || isInitiating || isVerifying}
                                >
                                    Continue
                                </Button>
                            )}
                            {currentStep === 2 && (
                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing || isInitiating || isVerifying}
                                >
                                    {isProcessing || isInitiating || isVerifying
                                        ? "Processing..."
                                        : `Pay ₹${total.toFixed(2)}`}
                                </Button>
                            )}
                        </div>
                    </div>
                    {!paymentSuccess && (
                        <div className="md:col-span-1">
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
                                        {plan.originalPrice && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-₹{(plan.originalPrice - plan.price).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>GST (18%):</span>
                                            <span>₹{tax.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-medium">
                                            <span>Total:</span>
                                            <span>₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        <span>Secured by Razorpay</span>
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