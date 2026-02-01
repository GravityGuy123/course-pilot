"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import axios from "axios";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import { authApi, bootstrapCsrf } from "@/lib/axios.config";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/schema";
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

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

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
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
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
        firstString(payload.new_password) ||
        firstString(payload.token) ||
        firstString(payload.uid) ||
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

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    if (didSubmit) return;
    setDidSubmit(true);
    clearErrors("root" as never);

    if (!uid || !token) {
      setDidSubmit(false);
      setError("root" as never, {
        type: "manual",
        message: "Invalid reset link. Please request a new password reset.",
      } as never);
      return;
    }

    try {
      await bootstrapCsrf();

      await authApi.post("/password-reset/confirm/", {
        uid,
        token,
        new_password: data.new_password,
      });

      toast.success("Password reset successful. You can now login.", toastStyle.success);
      window.setTimeout(() => router.push("/login"), 1000);
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

      toast.error("Reset failed. Please request a new link.", toastStyle.error);
    }
  };

  return (
    <main className="min-h-[100dvh]-">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950 sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Reset password
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Set a new password for your CoursePilot account.
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
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                New password
              </label>

              <div className="relative">
                <input
                  id="new_password"
                  type={show1 ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter a strong password"
                  disabled={isSubmitting}
                  {...register("new_password")}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 shadow-sm transition
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500
                             disabled:cursor-not-allowed disabled:opacity-60
                             dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShow1((v) => !v)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-violet-700
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                             disabled:cursor-not-allowed disabled:opacity-60
                             dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-950"
                  aria-label={show1 ? "Hide password" : "Show password"}
                >
                  {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.new_password?.message ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.new_password.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirm_password"
                  type={show2 ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  disabled={isSubmitting}
                  {...register("confirm_password")}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 shadow-sm transition
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500
                             disabled:cursor-not-allowed disabled:opacity-60
                             dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShow2((v) => !v)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-violet-700
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                             disabled:cursor-not-allowed disabled:opacity-60
                             dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-950"
                  aria-label={show2 ? "Hide password" : "Show password"}
                >
                  {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.confirm_password?.message ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.confirm_password.message}</p>
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
                  <span>Resetting…</span>
                </>
              ) : (
                <span>Reset password</span>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              <Link href="/login" className="font-semibold text-violet-700 hover:underline dark:text-indigo-300">
                Back to login
              </Link>
              {" · "}
              <Link
                href="/forgot-password"
                className="font-semibold text-violet-700 hover:underline dark:text-indigo-300"
              >
                Request a new link
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}