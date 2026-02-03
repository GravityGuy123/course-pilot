// src/app/dashboard/support/page.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { AxiosError } from "axios";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Bug,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast, SuccessToast } from "@/lib/toast";

type ApiErrorPayload = {
  detail?: string;
  message?: string;
  error?: string;
};

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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type SupportTopic = "account" | "billing" | "course" | "bug" | "other";

type SupportPayload = {
  subject: string;
  message: string;
  topic: SupportTopic;
  email?: string;
};

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <SupportPageInner />
    </ProtectedRoute>
  );
}

function SupportPageInner() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [topic, setTopic] = useState<SupportTopic>("account");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const canSubmit = useMemo(() => {
    const s = subject.trim();
    const m = message.trim();
    return s.length >= 6 && m.length >= 20;
  }, [subject, message]);

  const clearForm = useCallback(() => {
    setTopic("account");
    setSubject("");
    setEmail("");
    setMessage("");
    setLastTicketId(null);
  }, []);

  const submitTicket = useCallback(async () => {
    if (!canSubmit || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setLastTicketId(null);

    const payload: SupportPayload = {
      topic,
      subject: subject.trim(),
      message: message.trim(),
    };

    const trimmedEmail = email.trim();
    if (trimmedEmail) payload.email = trimmedEmail;

    // Candidates: backend may expose any of these
    const candidates: Array<{ url: string; method: "post" | "put" }> = [
      { url: "/support/tickets/", method: "post" },
      { url: "/support/", method: "post" },
      { url: "/helpdesk/tickets/", method: "post" },
      { url: "/tickets/", method: "post" },
      // fallback (sometimes you expose as feedback)
      { url: "/feedback/", method: "post" },
    ];

    try {
      let data: unknown = null;
      let lastErr: unknown = null;

      for (const c of candidates) {
        try {
          const res =
            c.method === "post"
              ? await api.post(c.url, payload, { signal: controller.signal })
              : await api.put(c.url, payload, { signal: controller.signal });

          data = res?.data;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const name = (e as { name?: string })?.name;
          if (name === "CanceledError" || name === "AbortError") throw e;
        }
      }

      if (lastErr) throw lastErr;

      // Try to extract ticket id from response
      const maybeObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
      const ticketId =
        (typeof maybeObj.id === "string" && maybeObj.id) ||
        (typeof maybeObj.ticket_id === "string" && maybeObj.ticket_id) ||
        (typeof maybeObj.reference === "string" && maybeObj.reference) ||
        null;

      setLastTicketId(ticketId);
      SuccessToast("Support request sent successfully", isDark);
      // Keep inputs so user can copy; optionally clear form after successful submit:
      // clearForm();
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to send support request");
      ErrorToast(msg, isDark);
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, isDark, loading, message, subject, topic]);

  const quickLinks = useMemo(
    () => [
      {
        title: "Billing",
        desc: "Check plan and payment history",
        href: "/dashboard/billing",
        icon: ShieldCheck,
      },
      {
        title: "Inbox",
        desc: "See system notifications",
        href: "/dashboard/inbox",
        icon: MessageSquare,
      },
      {
        title: "Profile",
        desc: "Update your account details",
        href: "/dashboard/profile",
        icon: HelpCircle,
      },
    ],
    []
  );

  const helpArticles = useMemo(
    () => [
      {
        title: "Trouble logging in?",
        desc: "Common causes: expired session, blocked cookies, wrong environment URL.",
        icon: HelpCircle,
      },
      {
        title: "Payments not reflecting",
        desc: "Sometimes webhooks delay. Check Billing page and refresh.",
        icon: ShieldCheck,
      },
      {
        title: "Course access issues",
        desc: "Confirm enrollment and refresh your dashboard.",
        icon: BookOpen,
      },
      {
        title: "Report a bug",
        desc: "Include the steps, what you expected, and any error message.",
        icon: Bug,
      },
    ],
    []
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Support
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get help, report issues, or contact the team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Back to dashboard
            </Link>

            <button
              type="button"
              onClick={clearForm}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset form
            </button>
          </div>
        </header>

        {/* Layout */}
        <section className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Left: quick help + links */}
          <aside className="lg:col-span-1 space-y-3">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Quick links
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {quickLinks.map((x) => (
                  <Link
                    key={x.title}
                    href={x.href}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  >
                    <div className="flex items-start gap-3">
                      <x.icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {x.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {x.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Common help topics
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {helpArticles.map((a) => (
                  <li
                    key={a.title}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <a.icon className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {a.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                If you want a proper “Help Center”, we can later add a docs route and render markdown.
              </p>
            </div>
          </aside>

          {/* Right: ticket form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Contact support
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Provide details so we can help faster (steps, expected vs actual, any error).
                  </p>
                </div>

                {loading ? (
                  <div className="shrink-0 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Spinner />
                    <span>Sending…</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                {/* Topic */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Topic
                  </label>
                  <select
                    aria-label="Support topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as SupportTopic)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  >
                    <option value="account">Account</option>
                    <option value="billing">Billing</option>
                    <option value="course">Courses / Learning</option>
                    <option value="bug">Bug / Error</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Unable to access a course after payment"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Minimum 6 characters.
                  </p>
                </div>

                {/* Email (optional) */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Email (optional)
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputMode="email"
                    placeholder="If different from your account email"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                </div>

                {/* Message */}
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder={
                      "Please include:\n- What you were trying to do\n- What you expected\n- What happened instead\n- Any error message"
                    }
                    className="w-full resize-y rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Minimum 20 characters.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-1">
                  <button
                    type="button"
                    onClick={submitTicket}
                    disabled={!canSubmit || loading}
                    className={cx(
                      "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                      "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800",
                      "disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Send support request"}
                  </button>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    By submitting, you agree to share the above details with support.
                  </div>
                </div>

                {lastTicketId ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
                    Ticket created:{" "}
                    <span className="font-mono font-semibold">{lastTicketId}</span>
                  </div>
                ) : null}
              </div>

              {/* Footer note */}
              {/* <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Backend endpoint note
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      This page tries common endpoints (
                      <span className="font-mono">/support/tickets/</span>,{" "}
                      <span className="font-mono">/support/</span>,{" "}
                      <span className="font-mono">/helpdesk/tickets/</span>,{" "}
                      <span className="font-mono">/tickets/</span>,{" "}
                      <span className="font-mono">/feedback/</span>). Once you confirm
                      your real route, keep only the correct one.
                    </p>
                  </div>
                </div>
              </div> */}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}