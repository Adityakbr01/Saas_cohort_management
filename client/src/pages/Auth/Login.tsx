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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/Theme/mode-toggle";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "@/store/features/auth/authApi";
import { useState, useMemo, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  role: z.enum(["mentor", "student", "organization", "super_admin"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Storage key for encryption
const STORAGE_KEY = "login_remember_key_v1";

// Helper functions for remember me functionality
const saveRememberedCredentials = (data: LoginFormValues) => {
  if (data.rememberMe) {
    const credentialsToSave = {
      email: data.email,
      password: data.password,
      role: data.role,
    };
    const encrypted = AES.encrypt(JSON.stringify(credentialsToSave), STORAGE_KEY).toString();
    localStorage.setItem("rememberedCredentials", encrypted);
  } else {
    localStorage.removeItem("rememberedCredentials");
  }
};

const getRememberedCredentials = (): Partial<LoginFormValues> => {
  try {
    const saved = localStorage.getItem("rememberedCredentials");
    if (saved) {
      const decrypted = AES.decrypt(saved, STORAGE_KEY).toString(encUtf8);
      const credentials = JSON.parse(decrypted);
      return {
        email: credentials.email || "",
        password: credentials.password || "",
        role: credentials.role || "student",
        rememberMe: true,
      };
    }
  } catch (error) {
    console.warn("Failed to load remembered credentials:", error);
    localStorage.removeItem("rememberedCredentials");
  }
  return {
    email: "",
    password: "",
    role: "student",
    rememberMe: false,
  };
};

function Login() {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: getRememberedCredentials(),
  });

  // Load remembered credentials on component mount
  useEffect(() => {
    const remembered = getRememberedCredentials();
    form.reset(remembered);
  }, [form]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Save or remove remembered credentials based on checkbox
      saveRememberedCredentials(data);

      const response = await loginUser(data).unwrap();

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      const { name, role } = response.data.user;
      const { accessToken, refreshToken } = response.data;

      // Show success toast
      toast.success("Login Successful", {
        description: `Welcome back, ${name || "User"}!`,
      });

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
      localStorage.setItem("refreshToken", JSON.stringify(refreshToken));

      // Role-based navigation
      const redirectPath = role === "super_admin" ? "/super_admin" : "/";
      navigate(redirectPath, { replace: true });

      // Optional: Clear any registration-related localStorage (if applicable)
      localStorage.removeItem("registerStep");
      localStorage.removeItem("initiateData");
      localStorage.removeItem("forgotPasswordStep");
    } catch (error: unknown) {
      let errorMessage = "Invalid credentials. Please try again.";

      if (error && typeof error === 'object') {
        const err = error as {
          data?: { message?: string };
          message?: string;
          status?: number;
        };

        if (err.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (err.status === 403) {
          errorMessage = "Account locked. Please contact support.";
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

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
              <FormField
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? `role-error` : undefined}
                        >
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage id="role-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-describedby="remember-me-description"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                      <p id="remember-me-description" className="text-xs text-muted-foreground">
                        Save my login credentials for next time
                      </p>
                    </div>
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
                className="w-full cursor-pointer"
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