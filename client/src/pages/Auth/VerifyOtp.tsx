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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useVerifyEmailMutation } from "@/store/features/auth/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

const completeSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit OTP"),
});

type CompleteFormValues = z.infer<typeof completeSchema>;

interface InitiateData {
  email: string;
  name: string;
  role: "mentor" | "student" | "organization" | "super_admin";
  password: string;
  phone?: string;
  slug?: string;
  specialization?: string;
  experience?: string;
  yearsOfExperience?: number;
  skillsExpertise?: string[] | string;
  adminPrivileges?: string[];
}

// Import the actual RegisterBody type from the API
interface RegisterBody {
  email: string;
  password: string;
  role: "mentor" | "student" | "organization" | "super_admin";
  name: string;
  phone?: string;
  slug?: string;
  specialization?: string;
  experience?: string;
  yearsOfExperience?: number;
  skillsExpertise?: string[];
  adminPrivileges?: string[];
}

interface RegisterResponse {
  data: {
    result: {
      id: string;
      name: string;
      email: string;
      role: string;
      lastLogin: string;
      isVerified: boolean;
    };
    token: string;
    refreshToken: string;
  };
  success: boolean;
  message: string;
  status: number;
}

interface RegisterUserMutation {
  (data: RegisterBody): {
    unwrap: () => Promise<RegisterResponse>;
  };
}

interface OTPFormProps {
  initiateData: InitiateData | null;
  setStep: (step: 1 | 2) => void;
  otpTimer: number;
  canResend: boolean;
  setOtpTimer: (time: number) => void;
  setCanResend: (canResend: boolean) => void;
  isRegistering: boolean;
  navigate: (path: string) => void;
  registerUser: RegisterUserMutation;
}

export default function OTPForm({
  initiateData,
  setStep,
  otpTimer,
  canResend,
  setOtpTimer,
  setCanResend,
  isRegistering,
  navigate,
  registerUser,
}: OTPFormProps) {
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    completeForm.reset({ otp: "" });
    otpInputRef.current?.focus();
  }, [completeForm]);

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
      const { email, role } = initiateData;
      const { otp } = data;
      const response = await verifyEmail({ email, otp, role }).unwrap();
      console.log("Email verification successful", response);
      toast.success("Registration successful", {
        description: response.message || `Welcome, ${response.data.name || "User"}`,
      });
      localStorage.removeItem("registerStep");
      localStorage.removeItem("initiateData");
      sessionStorage.removeItem("otpTimer");
      completeForm.reset({ otp: "" });
      navigate("/login");
    } catch (error: unknown) {
      let errorMessage = "Please try again.";
      if (error && typeof error === 'object') {
        const err = error as { data?: { message?: string }; message?: string };
        errorMessage = err.data?.message || err.message || errorMessage;
      }
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
      // Transform skillsExpertise to array if it's a string
      const skillsArray = typeof initiateData.skillsExpertise === 'string'
        ? initiateData.skillsExpertise.split(",").map((skill) => skill.trim()).filter((skill) => skill)
        : initiateData.skillsExpertise;

      const response = await registerUser({
        email: initiateData.email,
        name: initiateData.name,
        password: initiateData.password,
        role: initiateData.role,
        phone: initiateData.phone,
        slug: initiateData.slug,
        specialization: initiateData.specialization,
        experience: initiateData.experience,
        yearsOfExperience: initiateData.yearsOfExperience,
        skillsExpertise: skillsArray,
        adminPrivileges: initiateData.adminPrivileges,
      }).unwrap();
      console.log("OTP resent successfully", response);
      setOtpTimer(120);
      sessionStorage.setItem("otpTimer", "120");
      setCanResend(false);
      completeForm.reset({ otp: "" });
      toast.success("OTP resent", {
        description: response.message || "Check your email for the new OTP.",
      });
    } catch (error: unknown) {
      let errorMessage = "Please try again later.";
      let status: number | undefined;

      if (error && typeof error === 'object') {
        const err = error as {
          data?: { message?: string };
          message?: string;
          status?: number;
        };
        errorMessage = err.data?.message || err.message || errorMessage;
        status = err.status;
      }

      if (status === 429) {
        toast.error("Too many requests", {
          description: "Please wait before requesting another OTP.",
        });
      } else {
        toast.error("Failed to resend OTP", { description: errorMessage });
      }
    }
  };

  return (
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
        <Button type="submit" className="w-full cursor-pointer" disabled={isVerifying}>
          {isVerifying ? (
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
          disabled={isRegistering || !canResend}
          aria-label="Resend OTP"
        >
          {isRegistering ? (
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
  );
}