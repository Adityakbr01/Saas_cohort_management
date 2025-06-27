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
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "@/store/features/auth/authApi";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import OTPForm from "./VerifyOtp";

// Unified schema that handles all roles
const initiateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
  phone: z.string().optional(),
  slug: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  skillsExpertise: z.string().optional(),
  adminPrivileges: z
    .array(z.enum(["manage_users", "manage_cohorts", "view_analytics", "manage_billing"]))
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Mentor-specific validations
  if (data.role === "mentor") {
    if (!data.phone || data.phone.length < 10) {
      return false;
    }
    if (!data.specialization || data.specialization.length < 1) {
      return false;
    }
    if (!data.experience || data.experience.length < 1) {
      return false;
    }
    if (typeof data.yearsOfExperience !== "number" || data.yearsOfExperience < 0) {
      return false;
    }
    if (!data.skillsExpertise || data.skillsExpertise.trim().length < 1) {
      return false;
    }
  }
  return true;
}, {
  message: "Please fill in all required mentor fields",
  path: ["role"],
}).refine((data) => {
  // Super admin specific validations
  if (data.role === "super_admin") {
    if (!data.adminPrivileges || data.adminPrivileges.length < 1) {
      return false;
    }
  }
  return true;
}, {
  message: "At least one admin privilege is required for super admin",
  path: ["adminPrivileges"],
});

// Type for form values (currently unused but kept for future use)
// type InitiateFormValues = z.infer<typeof initiateSchema>;

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "fallback_secret_key_123";

const adminPrivilegeOptions = [
  { id: "manage_users" as const, label: "Manage Users" },
  { id: "manage_cohorts" as const, label: "Manage Cohorts" },
  { id: "view_analytics" as const, label: "View Analytics" },
  { id: "manage_billing" as const, label: "Manage Billing" },
];

export default function Register() {
  const [step, setStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem("registerStep");
      return savedStep === "2" ? 2 : 1;
    } catch {
      return 1;
    }
  });
  const [initiateData, setInitiateData] = useState(() => {
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

  const navigate = useNavigate();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();

  const initiateForm = useForm({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      name: initiateData?.name || "",
      email: initiateData?.email || "",
      password: "",
      confirmPassword: "",
      role: initiateData?.role || "student",
      phone: initiateData?.phone || "",
      slug: initiateData?.slug || "",
      specialization: initiateData?.specialization || "",
      experience: initiateData?.experience || "",
      yearsOfExperience: initiateData?.yearsOfExperience || "",
      skillsExpertise: Array.isArray(initiateData?.skillsExpertise)
        ? initiateData.skillsExpertise.join(", ")
        : initiateData?.skillsExpertise || "",
      adminPrivileges: initiateData?.adminPrivileges || [],
    },
    mode: "onChange",
  });

  // Reset fields when role changes
  useEffect(() => {
    const subscription = initiateForm.watch((value, { name }) => {
      if (name === "role") {
        if (value.role !== "mentor") {
          initiateForm.setValue("phone", "");
          initiateForm.setValue("specialization", "");
          initiateForm.setValue("experience", "");
          initiateForm.setValue("yearsOfExperience", "");
          initiateForm.setValue("skillsExpertise", "");
        }
        if (value.role !== "organization") {
          initiateForm.setValue("slug", "");
        }
        if (value.role !== "super_admin") {
          initiateForm.setValue("adminPrivileges", []);
        } else {
          initiateForm.setValue("adminPrivileges", ["manage_users", "manage_cohorts"]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [initiateForm]);

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
      return () => clearInterval(timer);
    }
  }, [step, otpTimer]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("registerStep", step.toString());
      if (initiateData) {
        const encrypted = AES.encrypt(JSON.stringify(initiateData), STORAGE_KEY).toString();
        localStorage.setItem("initiateData", encrypted);
      } else {
        localStorage.removeItem("initiateData");
      }
    } catch {
      toast.error("Storage error", { description: "Failed to save registration state.", duration: 5000 });
    }
  }, [step, initiateData]);

  const handleInitiate = async (data: z.infer<typeof initiateSchema>) => {
    if (!initiateForm.formState.isValid) {
      toast.error("Form is invalid", { description: "Please fix the errors before submitting." });
      initiateForm.trigger(); // Trigger validation to show errors
      return;
    }

    try {
      const {
        name,
        email,
        password,
        role,
        phone,
        slug,
        specialization,
        experience,
        yearsOfExperience,
        skillsExpertise,
        adminPrivileges,
      } = data;
      // Transform skillsExpertise from string to array for API
      const skillsArray = skillsExpertise
        ? skillsExpertise.split(",").map((skill) => skill.trim()).filter((skill) => skill)
        : undefined;

      const response = await registerUser({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        slug: slug || undefined,
        specialization: specialization || undefined,
        experience: experience || undefined,
        yearsOfExperience,
        skillsExpertise: skillsArray,
        adminPrivileges: adminPrivileges || undefined,
      }).unwrap();
      console.log("Registration initiated successfully", response);
      setInitiateData({
        email,
        name,
        role,
        password,
        phone,
        slug,
        specialization,
        experience,
        yearsOfExperience,
        skillsExpertise,
        adminPrivileges,
      });
      setStep(2);
      setOtpTimer(120);
      sessionStorage.setItem("otpTimer", "120");
      setCanResend(false);
      toast.success("OTP sent", { description: response.message || "Check your email for the OTP." });
    } catch (error: unknown) {
      let errorMessage = "Please try again later.";
      if (error && typeof error === 'object') {
        const err = error as { data?: { message?: string }; message?: string };
        errorMessage = err.data?.message || err.message || errorMessage;
      }
      toast.error("Registration failed", { description: errorMessage });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background">
      <header className="p-4 flex justify-end">
        <ModeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg space-y-8 bg-card p-8 rounded-xl shadow-2xl border">
          <h2 className="text-center text-3xl font-bold text-foreground">Create an account</h2>

          {step === 1 ? (
            <Form {...initiateForm}>
              <form onSubmit={initiateForm.handleSubmit(handleInitiate)} className="space-y-6">
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

                <FormField
                  control={initiateForm.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., John Doe"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `name-error` : ""}
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
                          placeholder="e.g., john@example.com"
                          {...field}
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `email-error` : ""}
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
                            placeholder="Enter password"
                            {...field}
                            autoComplete="new-password"
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `password-error` : ""}
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
                            placeholder="Confirm password"
                            {...field}
                            autoComplete="new-password"
                            aria-invalid={fieldState.invalid}
                            aria-describedby={fieldState.error ? `confirmPassword-error` : ""}
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
                <FormField
                  control={initiateForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone {initiateForm.watch("role") === "mentor" ? "(Required)" : "(Optional)"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +1234567890" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {initiateForm.watch("role") === "organization" && (
                  <FormField
                    control={initiateForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Slug (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., unique-slug" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {initiateForm.watch("role") === "mentor" && (
                  <>
                    <FormField
                      control={initiateForm.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software Engineering" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={initiateForm.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Developer at XYZ" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={initiateForm.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={initiateForm.control}
                      name="skillsExpertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills Expertise</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., JavaScript, Python, React"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {initiateForm.watch("role") === "super_admin" && (
                  <FormField
                    control={initiateForm.control}
                    name="adminPrivileges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Privileges</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {adminPrivilegeOptions.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option.id}
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    const updatedPrivileges = checked
                                      ? [...(field.value || []), option.id]
                                      : field.value?.filter((v: string) => v !== option.id) || [];
                                    field.onChange(updatedPrivileges);
                                  }}
                                />
                                <label htmlFor={option.id} className="text-sm">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isRegistering || !initiateForm.formState.isValid}>
                  {isRegistering ? (
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
                Already have an account?{" "}
                <Link
                  to="/login"
                  replace
                  className="font-medium text-primary hover:underline"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
              </p>
            </Form>
          ) : (
            <OTPForm
              initiateData={initiateData}
              setStep={setStep}
              otpTimer={otpTimer}
              canResend={canResend}
              setOtpTimer={setOtpTimer}
              setCanResend={setCanResend}
              isRegistering={isRegistering}
              navigate={navigate}
              registerUser={registerUser}
            />
          )}
        </div>
      </main>
    </div>
  );
}