// src/app/dashboard/admin/notifications/broadcast/page.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { AxiosError, AxiosRequestConfig } from "axios";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast, SuccessToast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";

type ApiErrorPayload = { detail?: string; message?: string; error?: string };

function getAxiosMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<ApiErrorPayload>;
  return (
    axiosErr?.response?.data?.detail ||
    axiosErr?.response?.data?.message ||
    axiosErr?.response?.data?.error ||
    axiosErr?.message ||
    fallback
  );
}

type Target = "all" | "students" | "tutors" | "moderators" | "admins";

type BroadcastResponse = {
  detail?: string;
  target?: string;
  scheduled_for?: string;
  notifications_created?: number;
  emails_targeted?: number;
};

function toLocalDatetimeInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// Convert "YYYY-MM-DDTHH:mm" (local) => ISO string
function localDatetimeToIso(value: string): string | null {
  const v = (value || "").trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminBroadcastPage() {
  return (
    <ProtectedRoute>
      <AdminBroadcastPageInner />
    </ProtectedRoute>
  );
}

function AdminBroadcastPageInner() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const { user } = useAuth();

  // Gate (Admin OR Moderator)
  const canBroadcast = Boolean(user && (user.is_admin || user.is_moderator));

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [target, setTarget] = useState<Target>("all");

  const [sendEmail, setSendEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledForLocal, setScheduledForLocal] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 10 * 60 * 1000))
  );

  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [result, setResult] = useState<BroadcastResponse | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const validate = useCallback((): string | null => {
    const t = title.trim();
    const m = message.trim();
    if (!t) return "Title is required";
    if (!m) return "Message is required";

    if (sendEmail) {
      const subj = (emailSubject || "").trim();
      const emsg = (emailMessage || "").trim();
      if (subj.length > 255) return "Email subject is too long (max 255)";
      // emailMessage can be empty (defaults to message), so no hard validation here
    }

    if (scheduleEnabled) {
      const iso = localDatetimeToIso(scheduledForLocal);
      if (!iso) return "Scheduled date/time is invalid";
    }

    return null;
  }, [emailMessage, emailSubject, message, scheduleEnabled, scheduledForLocal, sendEmail, title]);

  const buildPayload = useCallback(() => {
    const payload: Record<string, unknown> = {
      title: title.trim(),
      message: message.trim(),
      target,
      send_email: sendEmail,
    };

    const subj = (emailSubject || "").trim();
    const emsg = (emailMessage || "").trim();

    if (sendEmail && subj) payload.email_subject = subj;
    if (sendEmail && emsg) payload.email_message = emsg;

    if (scheduleEnabled) {
      const iso = localDatetimeToIso(scheduledForLocal);
      if (iso) payload.scheduled_for = iso;
    }

    return payload;
  }, [emailMessage, emailSubject, message, scheduleEnabled, scheduledForLocal, sendEmail, target, title]);

  const post = useCallback(
    async (url: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const config: AxiosRequestConfig = { signal: controller.signal };
      const payload = buildPayload();

      const res = await api.post(url, payload, config);
      return res?.data as unknown;
    },
    [buildPayload]
  );

  const sendBroadcast = useCallback(async () => {
    if (!canBroadcast) {
      ErrorToast("You do not have permission to broadcast.", isDark);
      return;
    }

    setInlineError(null);
    setResult(null);

    const err = validate();
    if (err) {
      setInlineError(err);
      ErrorToast(err, isDark);
      return;
    }

    setBusy(true);
    try {
      const data = await post("/notifications/admin/broadcast/");
      setResult((data as BroadcastResponse) || null);
      SuccessToast("Broadcast submitted successfully", isDark);
    } catch (e: unknown) {
      const msg = getAxiosMessage(e, "Failed to send broadcast");
      setInlineError(msg);
      ErrorToast(msg, isDark);
    } finally {
      setBusy(false);
    }
  }, [canBroadcast, isDark, post, validate]);

  const testSendToSelf = useCallback(async () => {
    if (!canBroadcast) {
      ErrorToast("You do not have permission to broadcast.", isDark);
      return;
    }

    setInlineError(null);
    setResult(null);

    const err = validate();
    if (err) {
      setInlineError(err);
      ErrorToast(err, isDark);
      return;
    }

    setBusy(true);
    try {
      const data = await post("/notifications/admin/broadcast/test/");
      setResult((data as BroadcastResponse) || null);
      SuccessToast("Test sent to you", isDark);
    } catch (e: unknown) {
      const msg = getAxiosMessage(e, "Failed to send test");
      setInlineError(msg);
      ErrorToast(msg, isDark);
    } finally {
      setBusy(false);
    }
  }, [canBroadcast, isDark, post, validate]);

  if (!canBroadcast) {
    return (
      <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <header className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Broadcast notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Admin/Moderator-only tool.
            </p>
          </header>

          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
            You don’t have permission to access this page.
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Broadcast notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Send an in-app notification to users (optionally email), with targeting and scheduling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link
              href="/dashboard/inbox"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              View inbox
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Back
            </Link>
          </div>
        </header>

        {inlineError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
            {inlineError}
          </div>
        ) : null}

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maintenance Notice"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the message users will receive..."
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Target</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as Target)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                  <option value="all">All users</option>
                  <option value="students">Students</option>
                  <option value="tutors">Tutors</option>
                  <option value="moderators">Moderators</option>
                  <option value="admins">Admins</option>
                </select>
              </label>

              <div className="space-y-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</span>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Schedule for later
                    </span>
                  </label>
                </div>

                {scheduleEnabled ? (
                  <input
                    aria-label="Schedule"
                    type="datetime-local"
                    value={scheduledForLocal}
                    onChange={(e) => setScheduledForLocal(e.target.value)}
                    className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Also send email (best-effort)
                </span>
              </label>

              {sendEmail ? (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject (defaults to title)"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Email message (defaults to message)"
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={testSendToSelf}
                disabled={busy}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Sending...
                  </span>
                ) : (
                  "Test send to me"
                )}
              </button>

              <button
                type="button"
                onClick={sendBroadcast}
                disabled={busy}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-60"
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Sending...
                  </span>
                ) : scheduleEnabled ? (
                  "Schedule broadcast"
                ) : (
                  "Send broadcast"
                )}
              </button>
            </div>
          </div>
        </section>

        {result ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-6 space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Result
            </p>
            <pre className="text-xs overflow-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-100">
{JSON.stringify(result, null, 2)}
            </pre>
          </section>
        ) : null}
      </div>
    </main>
  );
}