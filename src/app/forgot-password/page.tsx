// src/app/auth/forgot-password/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, toApiError } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

type UiState = "idle" | "submitting" | "success";

interface ForgotPasswordPayload {
  email: string;
}

/**
 * IMPORTANT:
 * Set this to match your backend route.
 * Since your authApi baseURL is `${SERVER_URL}/api/auth`,
 * this will call: POST /api/auth/password/forgot/
 */
const FORGOT_PASSWORD_ENDPOINT = "/password/forgot/";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(() => searchParams.get("next") || "/auth/login", [searchParams]);

  const [email, setEmail] = useState<string>("");
  const [uiState, setUiState] = useState<UiState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const canSubmit = useMemo(() => {
    const value = email.trim();
    return value.length >= 5 && value.includes("@") && value.includes(".");
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || uiState === "submitting") return;

    setUiState("submitting");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Keep this because your setup expects CSRF to be hit before unsafe methods.
      await authApi.get("/csrf/");

      const payload: ForgotPasswordPayload = { email: email.trim() };
      await authApi.post(FORGOT_PASSWORD_ENDPOINT, payload);

      setUiState("success");
      setSuccessMsg(
        "If an account exists for that email, we’ve sent password reset instructions."
      );
    } catch (err) {
      const apiErr = toApiError(err);

      // If endpoint is wrong, you'll likely see 404 here -> helpful to surface clearly.
      if (apiErr.status === 404) {
        setErrorMsg(
          "Forgot-password endpoint not found. Update FORGOT_PASSWORD_ENDPOINT to match your backend."
        );
      } else {
        setErrorMsg(apiErr.message);
      }

      setUiState("idle");
    }
  }, [canSubmit, email, uiState]);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we’ll send a reset link (if the account exists).
          </p>
        </div>

        <Card className="rounded-2xl border bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-900 dark:text-gray-100">
              Reset password
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {uiState === "success" && successMsg ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200 flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                Email address
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  autoComplete="email"
                  inputMode="email"
                  disabled={uiState === "submitting" || uiState === "success"}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: use the email you registered with.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || uiState === "submitting" || uiState === "success"}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {uiState === "submitting" ? "Sending…" : "Send reset link"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/login"
                className="text-violet-700 hover:text-violet-800 dark:text-violet-200 dark:hover:text-violet-100 font-medium"
              >
                Back to login
              </Link>

              <button
                type="button"
                onClick={() => router.push(next)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Continue
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          If you don’t receive an email, check spam/junk or try again later.
        </p>
      </div>
    </div>
  );
}