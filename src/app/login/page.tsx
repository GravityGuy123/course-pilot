"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";

import { useAuth } from "@/hooks/useAuth";
import { LoginSchema, loginSchema } from "@/lib/schema";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast, SuccessToast } from "@/lib/toast";
import { getDashboardPath } from "@/lib/route";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  // Hydration-safe theme usage (next-themes)
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const redirectDest = useMemo(() => getDashboardPath(user ?? null), [user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (user) router.replace(redirectDest);
  }, [user, redirectDest, router]);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    clearErrors("root" as never);

    try {
      await login(data);
      SuccessToast("Login successful!", isDark, { position: "top-right" });
      // NOTE: useEffect will redirect once user state is set
    } catch (err: unknown) {
      // If your login() throws structured errors, map them here safely:
      // - If it’s a string: show as root
      // - Otherwise show a generic toast
      if (typeof err === "string" && err.trim()) {
        setError("root" as never, { type: "server", message: err.trim() } as never);
        ErrorToast(err.trim(), isDark, { position: "top-center" });
        return;
      }

      setError("root" as never, {
        type: "server",
        message: "Invalid credentials or account issue. Please try again.",
      } as never);

      ErrorToast("Login failed", isDark, { position: "top-center" });
    }
  };

  return (
    // IMPORTANT: no global background overrides → preserves your app’s existing scheme
    <main className="min-h-dvh- flex items-center justify-center">
      <div className="mx-auto w-full max-w-6xl px-4 py-6- sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-2">
          {/* Left side: Brand/Context panel (hidden on small screens) */}
          <section className="relative hidden flex-col justify-between bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-white dark:from-violet-700 dark:to-indigo-800 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-white/15">
                CoursePilot
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight">Welcome back</h2>

              <p className="mt-3 max-w-md text-white/85">
                Log in to continue your learning journey, manage enrollments, and track progress —
                securely and reliably.
              </p>
            </div>

            <div className="text-sm text-white/75">
              Trouble logging in? Use “Forgot password” to regain access.
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white blur-3xl" />
            </div>
          </section>

          {/* Right side: Form */}
          <section className="p-6 sm:p-8 lg:p-10">
            <header className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Login
              </h1>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-violet-700 hover:underline dark:text-indigo-300"
                >
                  Sign Up
                </Link>
              </p>
            </header>

            {/* Root/server error */}
            {"root" in errors && (errors as Record<string, unknown>)?.root ? (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
              >
                {String(
                  (errors as { root?: { message?: string } }).root?.message ??
                    "Something went wrong."
                )}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email or Username
                </label>

                <input
                  id="identifier"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  disabled={isSubmitting}
                  {...register("identifier")}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500
                             disabled:cursor-not-allowed disabled:opacity-60
                             dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400"
                />

                {errors.identifier?.message ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                    {errors.identifier.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Password
                  </label>

                  {/* Forgot Password link (requested) */}
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-violet-700 hover:underline dark:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    {...register("password")}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 shadow-sm transition
                               placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500
                               disabled:cursor-not-allowed disabled:opacity-60
                               dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-violet-700
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                               disabled:cursor-not-allowed disabled:opacity-60
                               dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-950"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password?.message ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition
                           hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                           disabled:cursor-not-allowed disabled:opacity-60
                           dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-950"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}