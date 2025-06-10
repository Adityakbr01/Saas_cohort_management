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
import { useInitiateRegisterUserMutation, useComplateRegisterUserMutation } from "@/store/features/auth/authApi";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { useState } from "react";

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

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [initiateData, setInitiateData] = useState<Pick<InitiateFormValues, "email" | "password"> | null>(null);

  const navigate = useNavigate();
  const [initiateRegisterUser, { isLoading: isInitiating }] = useInitiateRegisterUserMutation();
  const [completeRegisterUser, { isLoading: isCompleting }] = useComplateRegisterUserMutation();

  const initiateForm = useForm<InitiateFormValues>({
    resolver: zodResolver(initiateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { otp: "" },
  });

  const handleInitiate = async (data: InitiateFormValues) => {
    try {
      const { name, email, password } = data;
      await initiateRegisterUser({ name, email, password }).unwrap();
      setInitiateData({ email, password });
      setStep(2);
      toast.success("OTP sent", { description: "Check your email for the OTP." });
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const handleComplete = async (data: CompleteFormValues) => {
    if (!initiateData) return;
    try {
      const { email, password } = initiateData;
      const { otp } = data;
      const response = await completeRegisterUser({ email, password, otp }).unwrap();
      toast.success("Registration successful", {
        description: `Welcome, ${response.data.user.name}`,
      });
      navigate(response.data.user.role === "super_admin" ? "/super_admin" : "/");
    } catch (error: any) {
      toast.error("OTP verification failed", {
        description: error?.data?.message || "Please try again.",
      });
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={initiateForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isInitiating}>
                  {isInitiating ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...completeForm}>
              <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-6 flex items-center flex-col">
                <FormField
                  control={completeForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col items-center"> 
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field} aria-label="One-time password input">
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full cursor-pointer" disabled={isCompleting}>
                  {isCompleting ? "Verifying..." : "Complete Registration"}
                </Button>
                <Button
                  variant="link"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    setStep(1);
                    completeForm.reset();
                  }}
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