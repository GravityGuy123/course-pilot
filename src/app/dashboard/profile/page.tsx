// src/app/dashboard/profile/page.tsx
"use client";

import Link from "next/link";
import { useCallback, useId, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { useAuth } from "@/context/auth-context";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import UserAvatar from "@/components/shared/UserAvatar";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { ErrorToast, SuccessToast } from "@/lib/toast";
import { NotificationsPanel, NotificationsToolbar } from "@/components/profile/notifications";

export type ProfileUser = {
  username: string;
  full_name: string;
  email: string;
  avatar?: string | null;
  is_email_verified: boolean;
  is_student?: boolean;
  is_tutor?: boolean;
  is_moderator?: boolean;
  is_admin?: boolean;
  date_joined?: string;
  last_login?: string;
};

function formatDateTime(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RoleBadge({
  label,
  tone,
}: {
  label: string;
  tone: "violet" | "blue" | "green" | "amber" | "gray";
}) {
  const cls =
    tone === "violet"
      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
      : tone === "green"
      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
      : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function KeyValueRow({ label, value, }: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right break-all">
        {value}
      </dd>
    </div>
  );
}

function ProfilePage() {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const pageTitleId = useId();
  const typedUser = user as ProfileUser | null;

  const [copied, setCopied] = useState(false);

  const copyEmail = useCallback(async () => {
    if (!typedUser?.email) return;
    try {
      await navigator.clipboard.writeText(typedUser.email);
      setCopied(true);
      SuccessToast("Email copied", isDark);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      ErrorToast("Failed to copy email", isDark);
    }
  }, [isDark, typedUser?.email]);

  if (authLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="h-8 w-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-4">
                <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-72 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!typedUser) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You’re not signed in.
          </p>
        </div>
      </div>
    );
  }

  const verified = Boolean(typedUser.is_email_verified);

  const roles = [
    { ok: Boolean(typedUser.is_student), label: "Student", tone: "blue" as const },
    { ok: Boolean(typedUser.is_tutor), label: "Tutor", tone: "violet" as const },
    { ok: Boolean(typedUser.is_moderator), label: "Moderator", tone: "amber" as const },
    { ok: Boolean(typedUser.is_admin), label: "Admin", tone: "green" as const },
  ].filter((r) => r.ok);

  const joined = formatDateTime(typedUser.date_joined);
  const lastLogin = formatDateTime(typedUser.last_login);

  const fallbackMuted = (
    <span className="text-gray-500 dark:text-gray-400">Not available</span>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border bg-white dark:bg-gray-900 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1
                id={pageTitleId}
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100"
              >
                Profile
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Your account details, roles, verification status, and notifications.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Link
                href="/dashboard/profile/settings"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
              >
                Edit profile
              </Link>

              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                {copied ? "Copied" : "Copy email"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT */}
            <section className="lg:col-span-4 space-y-6">
              <div className="rounded-xl border p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                    <UserAvatar user={typedUser} size={80} className="w-full h-full" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {typedUser.full_name || typedUser.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      @{typedUser.username}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {verified ? (
                        <RoleBadge label="Email verified" tone="green" />
                      ) : (
                        <RoleBadge label="Email not verified" tone="amber" />
                      )}
                    </div>
                  </div>
                </div>

                <dl className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
                  <KeyValueRow
                    label="Full name"
                    value={typedUser.full_name?.trim() ? typedUser.full_name : fallbackMuted}
                  />
                  <KeyValueRow label="Email" value={typedUser.email} />

                  {/* Always visible now */}
                  <KeyValueRow label="Joined" value={joined ?? fallbackMuted} />
                  <KeyValueRow label="Last login" value={lastLogin ?? fallbackMuted} />

                  {!typedUser.date_joined && !typedUser.last_login ? (
                    <div className="pt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined / Last login will appear once the backend includes them in the current user payload.
                      </p>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-xl border p-4 sm:p-5">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Roles</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map((r) => (
                      <RoleBadge key={r.label} label={r.label} tone={r.tone} />
                    ))
                  ) : (
                    <RoleBadge label="Guest (limited)" tone="gray" />
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4 sm:p-5">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Email verification
                </h2>

                {verified ? (
                  <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    Your email is verified ✅
                  </div>
                ) : (
                  <div className="mt-3">
                    <EmailVerificationForm
                      email={typedUser.email}
                      onVerified={async () => {
                        SuccessToast("Email verified", isDark);
                        await checkAuth();
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT */}
            <section className="lg:col-span-8">
              <div className="rounded-xl border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Latest updates from CoursePilot.
                    </p>
                  </div>
                  <NotificationsToolbar isDark={isDark} />
                </div>

                <NotificationsPanel isDark={isDark} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePageContent() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}