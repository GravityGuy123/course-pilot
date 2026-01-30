"use client";

import { useState, useContext, useEffect } from "react";
import { api, bootstrapCsrf } from "@/lib/axios.config";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import { AuthContext } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ModeratorApplication() {
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth?.user?.is_email_verified) setEmailVerified(true);
  }, [auth?.user]);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
    setCharCount(value.length);
  };

  const handleVerified = async () => {
    if (auth && typeof auth.checkAuth === "function") {
      try {
        await auth.checkAuth();
        setEmailVerified(true);
        setStatus("Email verified — profile updated");
      } catch {
        setEmailVerified(true);
        setStatus("Email verified");
      }
    }
  };

  const submit = async () => {
    if (!emailVerified) {
      setStatus("You must verify your email before submitting your application.");
      return;
    }

    if (!bio.trim()) {
      setStatus("Please enter your bio before submitting.");
      return;
    }

    try {
      await bootstrapCsrf();

      const res = await api.post("/admin/applications/apply/", {
        role: "moderator",
        bio,
      });

      if (res.status === 201)
        setStatus("Application submitted successfully! We'll review it shortly.");
      else setStatus("Unexpected response");
    } catch (err: unknown) {
      let msg = "Error";

      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if ("response" in e && typeof e.response === "object" && e.response !== null) {
          const r = e.response as Record<string, unknown>;
          if (r.data && typeof r.data === "object" && "detail" in r.data) {
            msg = String((r.data as Record<string, unknown>).detail);
          }
        }
        const maybeMessage = (e as Record<string, unknown>)["message"];
        if (typeof maybeMessage === "string") msg = maybeMessage;
      } else if (typeof err === "string") msg = err;

      setStatus(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/30 to-gray-50 dark:from-gray-950 dark:via-violet-950/20 dark:to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-violet-600 dark:text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Apply to Become a Moderator
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our moderation team and help create a safe, productive learning
            environment for everyone.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Info Banner */}
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 flex gap-3">
              <svg
                className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-100 mb-1">
                  About the Moderator Role
                </h3>
                <p className="text-sm text-violet-800 dark:text-violet-200 leading-relaxed">
                  Moderators help maintain a safe and productive learning
                  environment by monitoring content, assisting users, and
                  enforcing community guidelines. Share your relevant experience
                  below.
                </p>
              </div>
            </div>

            {/* Bio Textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Your Moderation Experience & Skills
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Tell us about your moderation experience, conflict resolution skills, familiarity with community guidelines, and why you'd be a great moderator..."
                  value={bio}
                  onChange={handleBioChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200 resize-none"
                  rows={8}
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {charCount}/1000
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Include any experience with content moderation, community
                management, or conflict resolution.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-violet-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={submit}
              disabled={!bio.trim() || !emailVerified} // disabled until email verified
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Submit Application
            </Button>

            {/* Status Message */}
            {status && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  status.includes("successfully") || status.includes("verified")
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {status.includes("successfully") ||
                status.includes("verified") ? (
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span
                  className={`text-sm font-medium ${
                    status.includes("successfully") ||
                    status.includes("verified")
                      ? "text-green-800 dark:text-green-200"
                      : "text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {status}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                  Verify Your Email
                </span>
              </div>
            </div>

            {/* Email Verification */}
            {auth?.user?.email ? (
              <EmailVerificationForm
                email={auth.user.email}
                onVerified={handleVerified}
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sign in required
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please sign in to verify your email address
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions about the moderator role?{" "}
            <a
              href="/contact"
              className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium underline-offset-2 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
