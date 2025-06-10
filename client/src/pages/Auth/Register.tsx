import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useInitiateRegisterUserMutation, useComplateRegisterUserMutation, useResendUserOtpMutation } from "@/store/features/auth/authApi";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";

const initiateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const completeSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit OTP"),
});

type InitiateFormValues = z.infer<typeof initiateSchema>;
type CompleteFormValues = z.infer<typeof completeSchema>;

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "fallback_secret_key_123";

export default function Register() {
  const [step, setStep] = useState<1 | 2>(() => {
    try {
      const savedStep = localStorage.getItem("registerStep");
      return savedStep === "2" ? 2 : 1;
    } catch {
      return 1;
    }
  });
  const [initiateData, setInitiateData] = useState<{
    email: string;
    password?: string;
    name?: string;
  } | null>(() => {
    try {
      const savedData = localStorage.getItem("initiateData");
      if (savedData) {
        const decrypted = AES.decrypt(savedData, STORAGE_KEY).toString(encUtf8);
        return JSON.parse(decrypted);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(() => {
    const savedTimer = sessionStorage.getItem("otpTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 120; // 2 minutes
  });
  const [canResend, setCanResend] = useState(otpTimer <= 0);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const storageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const [initiateRegisterUser, { isLoading: isInitiating }] = useInitiateRegisterUserMutation();
  const [completeRegisterUser, { isLoading: isCompleting }] = useComplateRegisterUserMutation();
  const [resendUserOtp, { isLoading: isResending }] = useResendUserOtpMutation();

  const initiateForm = useForm<InitiateFormValues>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      name: initiateData?.name || "",
      email: initiateData?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { otp: "" },
  });

  // OTP timer logic
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          const newTime = prev - 1;
          sessionStorage.setItem("otpTimer", newTime.toString());
          if (newTime <= 0) {
            setCanResend(true);
            clearInterval(timer);
          }
          return newTime;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [step]);

  // Debounced localStorage write
  const saveToStorage = useCallback(() => {
    if (storageTimeoutRef.current) {
      clearTimeout(storageTimeoutRef.current);
    }
    storageTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("registerStep", step.toString());
        if (initiateData) {
          const dataToStore = { email: initiateData.email, name: initiateData.name };
          const encrypted = AES.encrypt(JSON.stringify(dataToStore), STORAGE_KEY).toString();
          localStorage.setItem("initiateData", encrypted);
        } else {
          localStorage.removeItem("initiateData");
        }
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        toast.error("Storage error", { description: "Failed to save registration state." });
      }
    }, 200);
  }, [step, initiateData]);

  useEffect(() => {
    saveToStorage();
    if (step === 2) {
      completeForm.reset({ otp: "" });
      otpInputRef.current?.focus();
    }
    return () => {
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }
    };
  }, [step, initiateData, completeForm, saveToStorage]);

  const handleInitiate = async (data: InitiateFormValues) => {
    try {
      const { name, email, password } = data;
      const initialRes = await initiateRegisterUser({ name, email, password }).unwrap();
      console.log("Registration initiated successfully", initialRes);
      setInitiateData({ email, password, name });
      setStep(2);
      setOtpTimer(120);
      sessionStorage.setItem("otpTimer", "120");
      setCanResend(false);
      completeForm.reset({ otp: "" });
      toast.success("OTP sent", { description: initialRes.message || "Check your email for the OTP." });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Please try again later.";
      toast.error("Registration failed", { description: errorMessage });
    }
  };

  const handleComplete = async (data: CompleteFormValues) => {
    if (!initiateData) {
      toast.error("No registration data found", {
        description: "Please start the registration process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "" });
      return;
    }
    if (otpTimer <= 0) {
      toast.error("OTP expired", { description: "Please request a new OTP." });
      setCanResend(true);
      return;
    }
    try {
      const { email, password } = initiateData;
      if (!password) {
        throw new Error("Password missing. Please restart registration.");
      }
      const { otp } = data;
      const response = await completeRegisterUser({ email, password, otp }).unwrap();
      console.log("Registration completed successfully", response);
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }
      toast.success("Registration successful", {
        description: `Welcome, ${response.data.name || "User"}`,
      });
      localStorage.removeItem("registerStep");
      localStorage.removeItem("initiateData");
      sessionStorage.removeItem("otpTimer");
      setInitiateData(null);
      completeForm.reset({ otp: "" });
      navigate(response.data.role === "super_admin" ? "/super_admin" : "/");
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Please try again.";
      toast.error("OTP verification failed", { description: errorMessage });
    }
  };

  const handleResendOtp = async () => {
    if (!initiateData) {
      toast.error("No registration data found", {
        description: "Please start the registration process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "" });
      return;
    }
    try {
      const resendRes = await resendUserOtp({ email: initiateData.email }).unwrap();
      console.log("OTP resent successfully", resendRes);
      setOtpTimer(120);
      sessionStorage.setItem("otpTimer", "120");
      setCanResend(false);
      completeForm.reset({ otp: "" });
      toast.success("OTP resent", {
        description: resendRes.data.message || "Check your email for the new OTP."
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Please try again later.";
      if (error?.status === 429) {
        toast.error("Too many requests", {
          description: "Please wait before requesting another OTP.",
        });
      } else {
        toast.error("Failed to resend OTP", { description: errorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background">
      <header className="p-4 flex justify-end">
        <ModeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-2xl border">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Register an account
          </h2>

          {step === 1 ? (
            <Form {...initiateForm}>
              <form onSubmit={initiateForm.handleSubmit(handleInitiate)} className="space-y-6">
                <FormField
                  control={initiateForm.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `name-error` : undefined}
                        />
                      </FormControl>
                      <FormMessage id="name-error" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `email-error` : undefined}
                        />
                      </FormControl>
                      <FormMessage id="email-error" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            autoComplete="new-password"
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `password-error` : undefined}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage id="password-error" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            autoComplete="new-password"
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `confirmPassword-error` : undefined}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage id="confirmPassword-error" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isInitiating}>
                  {isInitiating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/login"
                  replace
                  className="font-medium text-primary hover:underline"
                  aria-label="Sign up for a new account"
                >
                  Sign In
                </Link>
              </p>
            </Form>
          ) : (
            <Form {...completeForm}>
              <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-6 flex items-center flex-col">
                <FormField
                  control={completeForm.control}
                  name="otp"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full flex flex-col items-center">
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            completeForm.setValue("otp", value, { shouldValidate: true });
                          }}
                          autoComplete="off"
                          ref={otpInputRef}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `otp-error` : `otp-timer`}
                          aria-label="One-time password input"
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                aria-label={`OTP digit ${i + 1}`}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage id="otp-error" />
                      <div
                        id="otp-timer"
                        className="text-sm text-muted-foreground mt-2 text-center"
                        aria-live="polite"
                      >
                        {otpTimer > 0
                          ? `OTP expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60)
                            .toString()
                            .padStart(2, "0")} minutes`
                          : "OTP has expired. Please request a new one."}
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full cursor-pointer" disabled={isCompleting}>
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-full cursor-pointer"
                  onClick={handleResendOtp}
                  disabled={isResending || !canResend}
                  aria-label="Resend OTP"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resending OTP...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    setStep(1);
                    completeForm.reset({ otp: "" });
                    localStorage.removeItem("registerStep");
                    localStorage.removeItem("initiateData");
                    sessionStorage.removeItem("otpTimer");
                    setOtpTimer(120);
                    setCanResend(false);
                  }}
                  aria-label="Back to registration form"
                >
                  Back to Registration
                </Button>
              </form>
            </Form>

          )}
        </div>
      </main>
    </div>
  );
}