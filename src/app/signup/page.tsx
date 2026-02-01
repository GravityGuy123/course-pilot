"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useTheme } from "next-themes";
import axios from "axios";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";

import { authApi, bootstrapCsrf } from "@/lib/axios.config";
import { registerFormSchema, RegisterSchema } from "@/lib/schema";
import { Spinner } from "@/components/ui/spinner";
import UserInfoFields from "@/components/auth/signup/UserInfoFields";
import PasswordFields from "@/components/auth/signup/PasswordFields";
import AvatarField from "@/components/auth/signup/AvatarField";

type RegisterForm = RegisterSchema & {
  avatar?: FileList;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "string" &&
    value[0].trim()
  ) {
    return value[0].trim();
  }
  return null;
}

export default function SignupPage() {
  const router = useRouter();

  // Avoid hydration mismatch with next-themes
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
    clearErrors,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const [didSubmit, setDidSubmit] = useState(false);

  useEffect(() => {
    if (isSubmitSuccessful) setDidSubmit(false);
  }, [isSubmitSuccessful]);

  const toastStyle = useMemo(() => {
    return {
      success: {
        position: "top-right" as const,
        className:
          "text-white bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
        style: {
          backgroundColor: isDark ? "#7c3aed" : "#8b5cf6",
          color: "#fff",
        },
      },
      error: {
        position: "top-center" as const,
        className:
          "text-white bg-red-600 dark:bg-red-500 px-4 py-3 rounded-xl shadow-lg border border-red-300/20 dark:border-red-400/20 font-medium",
        style: {
          backgroundColor: isDark ? "#ef4444" : "#f87171",
          color: "#fff",
        },
      },
    };
  }, [isDark]);

  const mapServerErrors = useCallback(
    (payload: unknown) => {
      if (!isRecord(payload)) return false;

      const nonField =
        firstString(payload.detail) ||
        firstString(payload.non_field_errors) ||
        firstString(payload.error) ||
        firstString(payload.message);

      if (nonField) {
        setError("root" as never, { type: "server", message: nonField } as never);
      }

      const fields: Array<keyof RegisterSchema> = [
        "username",
        "full_name",
        "email",
        "password",
        "confirm_password",
      ];

      let mapped = false;

      for (const field of fields) {
        const msg = firstString(payload[field as string]);
        if (msg) {
          setError(field, { type: "server", message: msg });
          mapped = true;
        }
      }

      const avatarMsg = firstString(payload.avatar);
      if (avatarMsg) {
        setError("avatar" as never, { type: "server", message: avatarMsg } as never);
        mapped = true;
      }

      return Boolean(nonField) || mapped;
    },
    [setError]
  );

  const onSubmit: SubmitHandler<RegisterForm> = useCallback(
    async (data) => {
      if (didSubmit) return;
      setDidSubmit(true);

      clearErrors("root" as never);

      try {
        await bootstrapCsrf();

        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("full_name", data.full_name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("confirm_password", data.confirm_password);

        const avatarFile = data.avatar?.[0];
        if (avatarFile) formData.append("avatar", avatarFile);

        await authApi.post("/register/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Registration successful! Redirecting to login…", toastStyle.success);
        window.setTimeout(() => router.push("/login"), 900);
      } catch (err: unknown) {
        setDidSubmit(false);

        if (axios.isAxiosError(err)) {
          const payload = err.response?.data;
          const mapped = mapServerErrors(payload);

          if (mapped) {
            toast.error("Please fix the highlighted fields and try again.", toastStyle.error);
            return;
          }
        }

        toast.error("Registration failed. Please try again.", toastStyle.error);
      }
    },
    [clearErrors, didSubmit, mapServerErrors, router, toastStyle.error, toastStyle.success]
  );

  return (
    // IMPORTANT: no global background overrides → preserves your app’s existing scheme
    <main className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-2">
          {/* Left side: Brand/Context panel (hidden on small screens) */}
          <section className="relative hidden flex-col justify-between bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-white dark:from-violet-700 dark:to-indigo-800 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-white/15">
                CoursePilot
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight">Create your account</h2>

              <p className="mt-3 max-w-md text-white/85">
                Learn, enroll, and track progress with a platform built for real users — secure auth,
                smooth UX, and reliable workflows.
              </p>
            </div>

            <div className="text-sm text-white/75">
              By continuing, you agree to the platform’s terms and privacy policy.
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
                Sign Up
              </h1>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-violet-700 hover:underline dark:text-indigo-300"
                >
                  Login
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <UserInfoFields register={register} errors={errors} isSubmitting={isSubmitting} />
              <PasswordFields register={register} errors={errors} isSubmitting={isSubmitting} />
              <AvatarField register={register} errors={errors} isSubmitting={isSubmitting} />

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
                    <span>Creating account…</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-medium text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    OR
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-700 dark:focus-visible:ring-offset-gray-950"
                aria-label="Sign up with Google"
              >
                <FaGoogle className="text-red-500" size={18} />
                Continue with Google
              </button>

              <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                We use secure HttpOnly cookies for authentication and CSRF protection for all unsafe
                requests.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}