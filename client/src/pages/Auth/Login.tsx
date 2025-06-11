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
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "@/store/features/auth/authApi";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginUser(data).unwrap();

      if (!response?.data?.result) {
        throw new Error("Invalid response from server");
      }

      const { name,role } = response.data.result;

      // Merge token into result object
      const fullResult = {
        ...response.data.result,
        token: response.data.token, // Inject token here
      };

      // Show success toast
      toast.success("Login Successful", {
        description: `Welcome back, ${name || "User"}!`,
      });

      // Save full result to localStorage
      localStorage.setItem("user", JSON.stringify(fullResult));

      // Role-based navigation
      const redirectPath = role === "super_admin" ? "/dashboard/super_admin" : "/";
      navigate(redirectPath, { replace: true });

      // Optional: Clear any registration-related localStorage (if applicable)
      localStorage.removeItem("registerStep");
      localStorage.removeItem("initiateData");
      localStorage.removeItem("forgotPasswordStep");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (error?.status === 429
          ? "Too many login attempts. Please try again later."
          : error?.status === 403
            ? "Account locked. Please contact support."
            : "Invalid credentials. Please try again.");
      toast.error("Login Failed", { description: errorMessage });
    }
  };

  // Memoize footer to prevent unnecessary re-renders
  const footer = useMemo(
    () => (
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Your App Name
      </footer>
    ),
    [],
  );

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background">
      <header className="p-4 flex justify-end">
        <ModeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-2xl border">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h2>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
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
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                  aria-label="Forgot your password?"
                >
                  Forgot password?
                </a>
              </div>
              <Button
                type="submit"
                className="w-full dark:bg-blue-50"
                disabled={isLoading}
                aria-live="polite"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              replace
              className="font-medium text-primary hover:underline"
              aria-label="Sign up for a new account"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
      {footer}
    </div>
  );
}

export default Login;