import { ModeToggle } from "@/components/Theme/mode-toggle";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForgotPasswordMutation, useForgotPasswordVerifyMutation, useResendForgotPasswordOTPMutation } from "@/store/features/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

// Define schemas
const initiateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

const completeSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit OTP"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Define types
type InitiateFormValues = z.infer<typeof initiateSchema>;
type CompleteFormValues = z.infer<typeof completeSchema>;
type InitiateData = { email: string; role: string } | null;

// Define error type for API responses
interface ApiError {
  status?: number;
  data?: { message?: string };
  message?: string;
}

// Update mutation type to include role
interface ForgotPasswordPayload {
  email: string;
  role: string;
}

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "fallback_secret_key_123";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(() => {
    try {
      const savedStep = localStorage.getItem("forgotPasswordStep");
      console.log("[DEBUG] Initial step from localStorage:", savedStep);
      return savedStep === "2" ? 2 : 1;
    } catch {
      console.error("[DEBUG] Error reading step from localStorage");
      return 1;
    }
  });
  const [initiateData, setInitiateData] = useState<InitiateData>(() => {
    try {
      const savedData = localStorage.getItem("forgotPasswordData");
      if (savedData) {
        const decrypted = AES.decrypt(savedData, STORAGE_KEY).toString(encUtf8);
        const parsed = JSON.parse(decrypted) as InitiateData;
        console.log("[DEBUG] Initial initiateData from localStorage:", parsed);
        return parsed;
      }
      return null;
    } catch {
      console.error("[DEBUG] Error reading initiateData from localStorage");
      return null;
    }
  });
  const [otpTimer, setOtpTimer] = useState(() => {
    const savedTimer = sessionStorage.getItem("forgotPasswordTimer");
    console.log("[DEBUG] Initial OTP timer from sessionStorage:", savedTimer);
    return savedTimer ? parseInt(savedTimer, 10) : 120;
  });
  const [canResend, setCanResend] = useState(otpTimer <= 0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formKey, setFormKey] = useState(0); // For forcing form re-render
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false); // Flag to prevent saveToStorage after reset

  const navigate = useNavigate();
  const [initiateForgotPassword, { isLoading: isInitiating }] = useForgotPasswordMutation();
  const [completeForgotPassword, { isLoading: isCompleting }] = useForgotPasswordVerifyMutation();
  const [resendForgotPasswordOtp, { isLoading: isResending }] = useResendForgotPasswordOTPMutation();

  const initiateForm = useForm<InitiateFormValues>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      email: initiateData?.email || "",
      role: initiateData?.role as InitiateFormValues["role"] || "student",
    },
  });

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
      role: initiateData?.role as CompleteFormValues["role"] || "student",
    },
  });

  // Initialize completeForm and ensure input accessibility
  useEffect(() => {
    if (step === 2 && initiateData) {
      console.log("[DEBUG] Initializing completeForm with role:", initiateData.role);
      completeForm.reset({
        otp: "",
        password: "",
        confirmPassword: "",
        role: initiateData.role as CompleteFormValues["role"],
      });
      // Explicitly set form values to ensure sync
      completeForm.setValue("otp", "");
      completeForm.setValue("password", "");
      completeForm.setValue("confirmPassword", "");
      completeForm.setValue("role", initiateData.role as CompleteFormValues["role"]);
      console.log("[DEBUG] Complete form values after reset:", completeForm.getValues());
      // Force form re-render
      setFormKey((prev) => prev + 1);
    }
  }, [step, initiateData, completeForm]);

  // OTP timer logic
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      if (timerRef) {
        clearInterval(timerRef);
      }

      const newTimer = setInterval(() => {
        setOtpTimer((prev) => {
          const newTime = prev - 1;
          console.log("[DEBUG] OTP timer:", newTime);
          sessionStorage.setItem("forgotPasswordTimer", newTime.toString());
          if (newTime <= 0) {
            setCanResend(true);
            clearInterval(newTimer);
            setTimerRef(null);
          }
          return newTime;
        });
      }, 1000);
      setTimerRef(newTimer);

      return () => {
        if (newTimer) {
          clearInterval(newTimer);
          setTimerRef(null);
        }
      };
    }
  }, [step, otpTimer]);

  // Debounced localStorage write
  const saveToStorage = useCallback(() => {
    if (isResetComplete) {
      console.log("[DEBUG] Skipping saveToStorage: Password reset is complete");
      return;
    }

    console.log("[DEBUG] Saving to localStorage:", { step, initiateData });
    try {
      localStorage.setItem("forgotPasswordStep", step.toString());
      if (initiateData) {
        const encrypted = AES.encrypt(
          JSON.stringify({ email: initiateData.email, role: initiateData.role }),
          STORAGE_KEY
        ).toString();
        localStorage.setItem("forgotPasswordData", encrypted);
      } else {
        localStorage.removeItem("forgotPasswordData");
      }
    } catch (error) {
      console.error("[DEBUG] Failed to save to localStorage:", error);
      toast.error("Storage error", { description: "Failed to save reset state." });
    }
  }, [step, initiateData, isResetComplete]);

  // Only save to storage when step or initiateData changes, and not after reset
  useEffect(() => {
    saveToStorage();
  }, [step, initiateData, saveToStorage]);

  const handleInitiate = async (data: InitiateFormValues) => {
    try {
      console.log("[DEBUG] Initiating forgot password with:", data);
      await initiateForgotPassword({ email: data.email, role: data.role } as ForgotPasswordPayload).unwrap();
      setInitiateData({ email: data.email, role: data.role });
      setStep(2);
      setOtpTimer(120);
      sessionStorage.setItem("forgotPasswordTimer", "120");
      setCanResend(false);
      setIsResetComplete(false); // Reset flag
      completeForm.reset({ otp: "", password: "", confirmPassword: "", role: data.role });
      setFormKey((prev) => prev + 1); // Force form re-render
      toast.success("OTP sent", { description: "Check your email for the new OTP." });
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("[DEBUG] Initiate error:", errorMessage);
      toast.error("Initiation Failed", { description: errorMessage });
    }
  };

  const handleComplete = async (data: CompleteFormValues) => {
    if (!initiateData) {
      console.error("[DEBUG] No initiateData found");
      toast.error("No reset data found", {
        description: "Please start the password reset process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "", password: "", confirmPassword: "", role: "student" });
      setFormKey((prev) => prev + 1); // Force form re-render
      return;
    }
    if (otpTimer <= 0) {
      console.log("[DEBUG] OTP expired");
      toast.error("OTP expired", { description: "Please request a new OTP." });
      setCanResend(true);
      return;
    }
    try {
      const { email, role } = initiateData;
      const { otp, password } = data;
      console.log("[DEBUG] Completing password reset with:", { email, role, otp, password });
      await completeForgotPassword({ email, otp, password, role }).unwrap();
      toast.success("Password Reset Successful", {
        description: "Your password has been updated. Please log in.",
      });

      // Clean up storage
      try {
        console.log("[DEBUG] Removing forgotPasswordStep from localStorage");
        localStorage.removeItem("forgotPasswordStep");
        console.log("[DEBUG] Removing forgotPasswordData from localStorage");
        localStorage.removeItem("forgotPasswordData");
        console.log("[DEBUG] Removing forgotPasswordTimer from sessionStorage");
        sessionStorage.removeItem("forgotPasswordTimer");
        console.log("[DEBUG] Storage after cleanup:", {
          forgotPasswordStep: localStorage.getItem("forgotPasswordStep"),
          forgotPasswordData: localStorage.getItem("forgotPasswordData"),
          forgotPasswordTimer: sessionStorage.getItem("forgotPasswordTimer"),
        });
      } catch (storageError) {
        console.error("[DEBUG] Storage cleanup error:", storageError);
        toast.error("Storage cleanup failed", { description: "Some data may persist in browser storage." });
      }

      // Set reset complete flag and update state
      setIsResetComplete(true);
      setInitiateData(null);
      completeForm.reset({ otp: "", password: "", confirmPassword: "", role: "student" });
      setFormKey((prev) => prev + 1); // Force form re-render

      // Delay navigation to ensure cleanup completes
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 200);
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("[DEBUG] Complete error:", errorMessage);
      toast.error("Password Reset Failed", { description: errorMessage });
    }
  };

  const handleResendOtp = async () => {
    if (!initiateData) {
      console.error("[DEBUG] No initiateData for resend OTP");
      toast.error("No reset data found", {
        description: "Please start the password reset process again.",
      });
      setStep(1);
      completeForm.reset({ otp: "", password: "", confirmPassword: "", role: "student" });
      setFormKey((prev) => prev + 1); // Force form re-render
      return;
    }
    try {
      console.log("[DEBUG] Resending OTP for email:", initiateData.email);
      await resendForgotPasswordOtp({ email: initiateData.email, role: initiateData.role }).unwrap();
      setOtpTimer(120);
      sessionStorage.setItem("forgotPasswordTimer", "120");
      setCanResend(false);
      setIsResetComplete(false); // Reset flag
      completeForm.reset({ otp: "", password: "", confirmPassword: "", role: initiateData.role as CompleteFormValues["role"] });
      setFormKey((prev) => prev + 1); // Force form re-render
      toast.success("OTP resent", { description: "Check your email for the new OTP." });
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      console.error("[DEBUG] Resend OTP error:", errorMessage);
      toast.error("Failed to resend OTP", { description: errorMessage });
    }
  };

  const handleApiError = (error: unknown): string => {
    let errorMessage = "An error occurred. Please try again.";
    if (error && typeof error === 'object') {
      const err = error as ApiError;
      if (err.status === 429) {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
    }
    return errorMessage;
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
                <FormField
                  control={initiateForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
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
            <Form key={formKey} {...completeForm}>
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
                            console.log("[DEBUG] OTP input value:", value);
                          }}
                          autoComplete="off"
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
                            value={field.value || ""} // Ensure value is controlled
                            onChange={(e) => {
                              field.onChange(e);
                              console.log("[DEBUG] Password input value:", e.target.value);
                            }}
                            className="w-full"
                            disabled={isCompleting}
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `password-error` : undefined}
                            onFocus={() => console.log("[DEBUG] Password input focused")}
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
                            value={field.value || ""} // Ensure value is controlled
                            onChange={(e) => {
                              field.onChange(e);
                              console.log("[DEBUG] Confirm password input value:", e.target.value);
                            }}
                            className="w-full"
                            disabled={isCompleting}
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `confirmPassword-error` : undefined}
                            onFocus={() => console.log("[DEBUG] Confirm password input focused")}
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
                    completeForm.reset({ otp: "", password: "", confirmPassword: "", role: "student" });
                    localStorage.removeItem("forgotPasswordStep");
                    localStorage.removeItem("forgotPasswordData");
                    sessionStorage.removeItem("forgotPasswordTimer");
                    setInitiateData(null);
                    setOtpTimer(120);
                    setCanResend(false);
                    setIsResetComplete(false); // Reset flag
                    setFormKey((prev) => prev + 1); // Force form re-render
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
        © {new Date().getFullYear()} EduLaunch. All rights reserved.
      </footer>
    </div>
  );
}