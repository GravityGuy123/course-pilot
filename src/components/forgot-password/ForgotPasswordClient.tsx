"use client";

import React, { useMemo, useState } from "react";
import { authApi, bootstrapCsrf, toApiError } from "@/lib/axios.config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && email.includes("@") && !loading;
  }, [email, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("idle");
    setMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await bootstrapCsrf();
      await authApi.post("/forgot-password/", { email: cleanEmail });

      setStatus("success");
      setMessage(
        "If an account exists for that email, a reset link has been sent. Please check your inbox (and spam)."
      );
    } catch (err: unknown) {
      const apiErr = toApiError(err);
      setStatus("error");
      setMessage(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-0px)] w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we’ll send you a password reset link.
          </p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {status !== "idle" ? (
                <div
                  className={[
                    "rounded-xl border px-4 py-3 text-sm",
                    status === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-red-200 bg-red-50 text-red-900",
                  ].join(" ")}
                >
                  {message}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Remembered your password?{" "}
                <a href="/login" className="font-medium underline underline-offset-4">
                  Go back to login
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}