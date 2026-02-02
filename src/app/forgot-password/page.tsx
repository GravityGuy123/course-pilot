"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import axios from "axios";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";

import { authApi, bootstrapCsrf } from "@/lib/axios.config";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/lib/schema";
import { Spinner } from "@/components/ui/spinner";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }
  return null;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const toastStyle = useMemo(() => {
    return {
      success: {
        position: "top-right" as const,
        className:
          "text-white bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
        style: { backgroundColor: isDark ? "#7c3aed" : "#8b5cf6", color: "#fff" },
      },
      error: {
        position: "top-center" as const,
        className:
          "text-white bg-red-600 dark:bg-red-500 px-4 py-3 rounded-xl shadow-lg border border-red-300/20 dark:border-red-400/20 font-medium",
        style: { backgroundColor: isDark ? "#ef4444" : "#f87171", color: "#fff" },
      },
    };
  }, [isDark]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const [didSubmit, setDidSubmit] = useState(false);

  useEffect(() => {
    if (isSubmitSuccessful) setDidSubmit(false);
  }, [isSubmitSuccessful]);

  const mapServerError = useCallback(
    (payload: unknown) => {
      if (!isRecord(payload)) return false;

      const msg =
        firstString(payload.detail) ||
        firstString(payload.email) ||
        firstString(payload.non_field_errors) ||
        firstString(payload.message);

      if (msg) {
        setError("root" as never, { type: "server", message: msg } as never);
        return true;
      }
      return false;
    },
    [setError]
  );

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    if (didSubmit) return;
    setDidSubmit(true);
    clearErrors("root" as never);

    try {
      await bootstrapCsrf();

      await authApi.post("/password-reset/", { email: data.email });

      // backend always returns 200 (anti-enumeration). Great.
      toast.success("If the email is linked to an account, a reset link has been sent.", toastStyle.success);

      // optional UX: return to login after a short moment
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (err: unknown) {
      setDidSubmit(false);

      if (axios.isAxiosError(err)) {
        const payload = err.response?.data;
        const mapped = mapServerError(payload);
        if (mapped) {
          toast.error("Please check the form and try again.", toastStyle.error);
          return;
        }
      }

      toast.error("Request failed. Please try again.", toastStyle.error);
    }
  };

  return (
    <main className="min-h-[100dvh]-">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-10- sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950 sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Forgot password
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter the email linked to your account. If it matches an account, we’ll send a reset link.
            </p>
          </header>

          {"root" in errors && (errors as Record<string, unknown>)?.root ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
            >
              {String((errors as { root?: { message?: string } }).root?.message ?? "Something went wrong.")}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                disabled={isSubmitting}
                {...register("email")}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400" />
              {errors.email?.message ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.email.message}</p>
              ) : null}
            </div>

            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              For security reasons, reset links are only sent to the email address registered on your
              CoursePilot account. We can’t confirm whether an account exists.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-950"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span>Sending…</span>
                </>
              ) : (
                <span>Send reset link</span>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-violet-700 hover:underline dark:text-indigo-300">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}