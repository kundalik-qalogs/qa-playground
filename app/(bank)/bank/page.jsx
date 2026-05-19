"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { setCurrentSession } from "@/lib/bankStorage";
import BankTestCases from "@/app/(bank)/bank/_components/BankTestCases";
import { bankLoginTC } from "@/data/bankTestCases";

export default function BankLoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    if (typeof window !== "undefined") {
      const currentUser = sessionStorage.getItem("currentUser");
      if (currentUser) {
        router.push("/bank/dashboard");
      }

      // Load remembered username
      const rememberedUser = localStorage.getItem("rememberedUser");
      if (rememberedUser) {
        setUsername(rememberedUser);
        setRememberMe(true);
      }
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setAlertMessage("");

    // Validation
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check credentials
    if (username === "admin" && password === "admin123") {
      setCurrentSession("admin", "admin");
      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      router.push("/bank/dashboard");
    } else if (username === "viewer" && password === "viewer123") {
      setCurrentSession("viewer", "viewer");
      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      router.push("/bank/dashboard");
    } else {
      // Failed login
      setAlertMessage("Invalid username or password. Please try again.");
    }
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setRememberMe(false);
    setErrors({});
    setAlertMessage("");
  };

  if (!mounted) return null;

  const interviewPracticeBanner = (
    <Link
      href="/study-tracker/interview-practice"
      prefetch={false}
      className="group block rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-left shadow-sm shadow-emerald-900/10 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            2 free interviews
          </span>
          <span className="mt-1 block text-sm font-semibold text-gray-950 dark:text-white">
            Have an interview coming up?
          </span>
          <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
            Practice with AI and boost confidence before the real call.
          </span>
        </span>
        <span className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-900/20 transition-colors group-hover:bg-emerald-700">
          Start now
        </span>
      </span>
    </Link>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 py-16 relative"
      id="bank-login-page-container"
    >
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 rounded-full z-50 shadow-md"
        id="theme-toggle"
        data-testid="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" id="theme-sun-icon" />
        ) : (
          <Moon className="h-5 w-5" id="theme-moon-icon" />
        )}
      </Button>

      <div className="w-full max-w-6xl mx-auto space-y-16" id="bank-login-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Infographic (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col items-center text-center space-y-8 select-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-[80px] opacity-20 animate-pulse" />
              <div className="relative p-12 bg-card border border-border/50 shadow-2xl rounded-full">
                <Building2 className="h-32 w-32 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold tracking-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SecureBank
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Your premier automation testing practice ground. Master complex UI interactions, state management, and end-to-end testing scenarios.
              </p>
            </div>
          </div>

          {/* Right Side: Login Panel */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <Card
              className="backdrop-blur-sm bg-card/95 shadow-2xl border border-border/50"
              id="bank-login-card"
            >
              <CardHeader className="text-center space-y-4" id="bank-login-header">
                <div className="flex justify-center lg:hidden" id="logo-container">
                  <div
                    className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full animate-bounce"
                    id="logo-wrapper"
                  >
                    <Building2
                      className="h-12 w-12 text-white"
                      id="bank-logo"
                      data-testid="bank-logo"
                    />
                  </div>
                </div>
                <CardTitle
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  id="app-title"
                >
                  SecureBank Demo
                </CardTitle>
                <CardDescription id="app-subtitle">
                  Automation Testing Practice Application
                </CardDescription>
              </CardHeader>

              <CardContent id="bank-login-content">
                <form
                  onSubmit={handleSubmit}
                  id="login-form"
                  name="loginForm"
                  data-testid="login-form"
                >
                  <div className="space-y-4" id="login-form-fields">
                    <div className="space-y-2" id="username-field-container">
                      <Label htmlFor="username" id="username-label">
                        Username
                      </Label>
                      <Input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        data-testid="username-input"
                        data-field="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => {
                          if (!username.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              username: "Username is required",
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, username: "" }));
                          }
                        }}
                      />
                      {errors.username && (
                        <p
                          className="text-sm text-destructive"
                          id="username-error"
                          data-testid="username-error"
                        >
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2" id="password-field-container">
                      <Label htmlFor="password" id="password-label">
                        Password
                      </Label>
                      <div className="relative" id="password-input-wrapper">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          placeholder="Enter your password"
                          data-testid="password-input"
                          data-field="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => {
                            if (!password.trim()) {
                              setErrors((prev) => ({
                                ...prev,
                                password: "Password is required",
                              }));
                            } else {
                              setErrors((prev) => ({ ...prev, password: "" }));
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          id="toggle-password"
                          data-testid="toggle-password-btn"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p
                          className="text-sm text-destructive"
                          id="password-error"
                          data-testid="password-error"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center space-x-2"
                      id="remember-me-container"
                    >
                      <Checkbox
                        id="remember-me"
                        name="rememberMe"
                        data-testid="remember-checkbox"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                      />
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-normal cursor-pointer"
                        id="remember-me-label"
                      >
                        Remember me
                      </Label>
                    </div>

                    {alertMessage && (
                      <Alert
                        variant="destructive"
                        id="login-alert"
                        data-testid="login-alert"
                        role="alert"
                        aria-live="assertive"
                      >
                        <AlertDescription id="alert-message">
                          ⚠️ {alertMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2" id="login-actions-container">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        id="login-btn"
                        data-testid="login-button"
                        data-action="login"
                      >
                        Login
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        id="clear-btn"
                        data-testid="clear-button"
                        data-action="clear"
                        onClick={handleClear}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>

              <CardFooter id="bank-login-footer">
                <div className="w-full space-y-2" id="demo-credentials-wrapper">
                  <p
                    className="text-center text-sm font-semibold"
                    id="demo-credentials-title"
                  >
                    Demo Credentials:
                  </p>
                  <table
                    className="w-full text-sm border rounded-md overflow-hidden"
                    id="demo-credentials"
                    data-testid="demo-credentials-table"
                  >
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Role</th>
                        <th className="text-left px-3 py-2 font-medium">
                          Username
                        </th>
                        <th className="text-left px-3 py-2 font-medium">
                          Password
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">
                          Full Access
                        </td>
                        <td className="px-3 py-2">
                          <code
                            className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs"
                            id="demo-username-text"
                            data-testid="demo-username"
                          >
                            admin
                          </code>
                        </td>
                        <td className="px-3 py-2">
                          <code
                            className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs"
                            id="demo-password-text"
                            data-testid="demo-password"
                          >
                            admin123
                          </code>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">
                          Read-only
                        </td>
                        <td className="px-3 py-2">
                          <code
                            className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs"
                            id="demo-viewer-username"
                            data-testid="demo-viewer-username"
                          >
                            viewer
                          </code>
                        </td>
                        <td className="px-3 py-2">
                          <code
                            className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs"
                            id="demo-viewer-password"
                            data-testid="demo-viewer-password"
                          >
                            viewer123
                          </code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {interviewPracticeBanner}
        </div>

        {/* Bottom Test Cases Section */}
        <div className="w-full max-w-4xl mx-auto pt-8">
          <BankTestCases
            testCases={bankLoginTC}
            title="Login Page — Test Cases"
          />
        </div>
      </div>
    </div>
  );
}
