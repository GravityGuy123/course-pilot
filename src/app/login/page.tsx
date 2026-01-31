"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const redirectDest = useMemo(() => getDashboardPath(user ?? null), [user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (user) router.replace(redirectDest);
  }, [user, redirectDest, router]);

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data);
      SuccessToast("Login successful!", isDark, { position: "top-right" });
    } catch {
      ErrorToast("Login failed", isDark, { position: "top-center" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Login
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="block text-sm text-gray-600 dark:text-gray-300">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="Enter your email or username"
              disabled={isSubmitting}
              {...register("identifier")}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400"
            />
            {errors.identifier?.message ? (
              <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm text-gray-600 dark:text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isSubmitting}
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pr-11 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password?.message ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-violet-600 py-2 font-medium text-white transition hover:bg-violet-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isSubmitting ? <Spinner /> : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-violet-600 hover:underline dark:text-indigo-400"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}