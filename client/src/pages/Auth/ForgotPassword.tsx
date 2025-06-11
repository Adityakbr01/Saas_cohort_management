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
import { useNavigate } from "react-router-dom";
import {
  useInitiateForgotPasswordMutation,
  useComplateForgotPasswordMutation,
  useResendForgotPasswordOtpMutation,
} from "@/store/features/auth/authApi";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";

const initiateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const completeSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit OTP"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InitiateFormValues = z.infer<typeof initiateSchema>;
type CompleteFormValues = z.infer<typeof completeSchema>;

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "fallback_secret_key_123";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(() => {
    try {
      const savedStep = localStorage.getItem("forgotPasswordStep");
      return savedStep === "2" ? 2 : 1;
    } catch {
      return 1;
    }
  });
  const [initiateData, setInitiateData] = useState<{ email: string } | null>(() => {
    try {
      const savedData = localStorage.getItem("forgotPasswordData");
      if (savedData) {
        const decrypted = AES.decrypt(savedData, STORAGE_KEY).toString(encUtf8);
        return JSON.parse(decrypted);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [otpTimer, setOtpTimer] = useState(() => {
    const savedTimer = sessionStorage.getItem("forgotPasswordTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 120; // 2 minutes
  });
  const [canResend, setCanResend] = useState(otpTimer <= 0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const storageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const [initiateForgotPassword, { isLoading: isInitiating }] = useInitiateForgotPasswordMutation();
  const [completeForgotPassword, { isLoading: isCompleting }] = useComplateForgotPasswordMutation();
  const [resendForgotPasswordOtp, { isLoading: isResending }] = useResendForgotPasswordOtpMutation();

  const initiateForm = useForm<InitiateFormValues>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      email: initiateData?.email || "",
    },
  });

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  // OTP timer logic
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          const newTime = prev - 1;
          sessionStorage.setItem("forgotPasswordTimer", newTime.toString());
          if (newTime <= 0) {
            setCanResend(true);
            clearInterval(timer);
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Debounced localStorage write
  const saveToStorage = useCallback(() => {
    if (storageTimeoutRef.current) {
      clearTimeout(storageTimeoutRef.current);
    }
    storageTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("forgotPasswordStep", step.toString());
        if (initiateData) {
          const encrypted = AES.encrypt(JSON.stringify({ email: initiateData.email }), STORAGE_KEY).toString();
          localStorage.setItem("forgotPasswordData", encrypted);
        } else {
          localStorage.removeItem("forgotPasswordData");
        }
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        toast.error("Storage error", { description: "Failed to save reset state." });
      }
    }, 200);
  }, [step, initiateData]);

  useEffect(() => {
    saveToStorage();
    if (step === 2) {
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
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
      await initiateForgotPassword({ email: data.email }).unwrap();
      setInitiateData({ email: data.email });
      setStep(2);
      setOtpTimer(120);
      sessionStorage.setItem("forgotPasswordTimer", "120");
      setCanResend(false);
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
      toast.success("OTP sent", { description: "Check your email for the OTP." });
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (error?.status === 429
          ? "Too many requests. Please try again later."
          : "Failed to initiate password reset. Please try again.");
      toast.error("Initiation Failed", { description: errorMessage });
    }
  };

  const handleComplete = async (data: CompleteFormValues) => {
    if (!initiateData) {
      toast.error("No reset data found", {
        description: "Please start the password reset process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
      return;
    }
    if (otpTimer <= 0) {
      toast.error("OTP expired", { description: "Please request a new OTP." });
      setCanResend(true);
      return;
    }
    try {
      const { email } = initiateData;
      const { otp, password } = data;
      await completeForgotPassword({ email, otp, password }).unwrap();
 
      toast.success("Password Reset Successful", {
        description: "Your password has been updated. Please log in.",
      });
      localStorage.removeItem("forgotPasswordStep");
      localStorage.removeItem("forgotPasswordData");
      sessionStorage.removeItem("forgotPasswordTimer");
      setInitiateData(null);
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
      navigate("/login", { replace: true });
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (error?.status === 429
          ? "Too many requests. Please try again later."
          : "Invalid OTP or server error. Please try again.");
      toast.error("Password Reset Failed", { description: errorMessage });
    }
  };

  const handleResendOtp = async () => {
    if (!initiateData) {
      toast.error("No reset data found", {
        description: "Please start the password reset process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
      return;
    }
    try {
      await resendForgotPasswordOtp({ email: initiateData.email }).unwrap();
      setOtpTimer(120);
      sessionStorage.setItem("forgotPasswordTimer", "120");
      setCanResend(false);
      completeForm.reset({ otp: "", password: "", confirmPassword: "" });
      toast.success("OTP resent", { description: "Check your email for the new OTP." });
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (error?.status === 429
          ? "Too many requests. Please wait before requesting another OTP."
          : "Failed to resend OTP. Please try again.");
      toast.error("Failed to resend OTP", { description: errorMessage });
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
            Reset Your Password
          </h2>
          {step === 1 ? (
            <Form {...initiateForm}>
              <form onSubmit={initiateForm.handleSubmit(handleInitiate)} className="space-y-6">
                <FormField
                  control={initiateForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...field}
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `email-error` : undefined}
                        />
                      </FormControl>
                      <FormMessage id="email-error" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isInitiating} aria-live="polite">
                  {isInitiating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-full cursor-pointer"
                  onClick={() => navigate("/login")}
                  aria-label="Back to login"
                >
                  Back to Login
                </Button>
              </form>
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
                <FormField
                  control={completeForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            {...field}
                            className="w-full"
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
                  control={completeForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            {...field}
                            className="w-full"
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
                <Button type="submit" className="w-full cursor-pointer" disabled={isCompleting} aria-live="polite">
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
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
                    completeForm.reset({ otp: "", password: "", confirmPassword: "" });
                    localStorage.removeItem("forgotPasswordStep");
                    localStorage.removeItem("forgotPasswordData");
                    sessionStorage.removeItem("forgotPasswordTimer");
                    setInitiateData(null);
                    setOtpTimer(120);
                    setCanResend(false);
                  }}
                  aria-label="Back to email input"
                >
                  Back to Email Input
                </Button>
              </form>
            </Form>
          )}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Your App Name
      </footer>
    </div>
  );
}