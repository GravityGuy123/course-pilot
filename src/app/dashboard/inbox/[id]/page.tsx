"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast, SuccessToast } from "@/lib/toast";

type PageProps = {
  params: { id: string };
};

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

type InboxItem = {
  id: string;
  title: string;
  message: string;
  created_at?: string;
  read?: boolean;
  type?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickBoolean(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function normalizeInboxItem(raw: unknown, idFallback: string): InboxItem {
  const r = isRecord(raw) ? raw : {};

  const id = pickString(r.id, idFallback);
  const title = pickString(r.title, "Message");
  const message =
    pickString(r.message, "") ||
    pickString(r.body, "") ||
    pickString(r.content, "");

  const created_at =
    pickString(r.created_at, "") ||
    pickString(r.createdAt, "") ||
    pickString(r.created, "") ||
    "";

  const read =
    pickBoolean(r.read) ??
    pickBoolean(r.is_read) ??
    pickBoolean(r.isRead);

  const type =
    pickString(r.type, "") ||
    pickString(r.category, "") ||
    pickString(r.kind, "");

  return {
    id,
    title,
    message,
    created_at: created_at || undefined,
    read,
    type: type || undefined,
  };
}

export default function InboxMessagePage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <InboxMessagePageInner id={params.id} />
    </ProtectedRoute>
  );
}

function InboxMessagePageInner({ id }: { id: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InboxItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const displayDate = useMemo(() => {
    if (!item?.created_at) return "";
    const d = new Date(item.created_at);
    return Number.isNaN(d.getTime())
      ? item.created_at
      : d.toLocaleString();
  }, [item?.created_at]);

  const canMarkRead = useMemo(
    () => Boolean(item) && !busy && item?.read !== true,
    [busy, item]
  );

  const fetchItem = useCallback(async () => {
    if (!id) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    const candidates = [
      `/notifications/${id}/`,
      `/notifications/inbox/${id}/`,
      `/inbox/${id}/`,
    ];

    try {
      let data: unknown = null;
      let lastErr: unknown = null;

      for (const url of candidates) {
        try {
          const config: AxiosRequestConfig = {
            signal: controller.signal,
          };
          const res = await api.get(url, config);
          data = res?.data;
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const name = (e as { name?: string })?.name;
          if (name === "CanceledError" || name === "AbortError") {
            throw e;
          }
        }
      }

      if (lastErr) throw lastErr;

      if (mountedRef.current) {
        setItem(normalizeInboxItem(data, id));
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load message");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setItem(null);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id, isDark]);

  const markAsRead = useCallback(async () => {
    if (!item || busy || item.read === true) return;

    setBusy(true);
    setInlineError(null);

    try {
      try {
        await api.post(`/notifications/${item.id}/read/`);
      } catch {
        await api.patch(`/notifications/${item.id}/`, { read: true });
      }

      setItem((prev) => (prev ? { ...prev, read: true } : prev));
      SuccessToast("Marked as read", isDark);
    } catch (err: unknown) {
      const msg = getAxiosMessage(err, "Could not mark as read");
      ErrorToast(msg, isDark);
      setInlineError(msg);
    } finally {
      setBusy(false);
    }
  }, [busy, isDark, item]);

  useEffect(() => {
    mountedRef.current = true;
    fetchItem();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchItem]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Back
            </button>

            <Link
              href="/dashboard/inbox"
              className="text-sm font-medium text-violet-700 dark:text-violet-400 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded"
            >
              Inbox
            </Link>

            {typeof item?.read === "boolean" ? (
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                  item.read
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                }`}
              >
                {item.read ? "Read" : "Unread"}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={fetchItem}
              disabled={loading || busy}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={markAsRead}
              disabled={!canMarkRead}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              {busy ? "Working..." : item?.read ? "Read" : "Mark as read"}
            </button>
          </div>
        </header>

        {inlineError ? (
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {inlineError}
          </div>
        ) : null}

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Spinner />
              <span className="sr-only">Loading message</span>
            </div>
          ) : !item ? (
            <div className="p-6 sm:p-8 space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Message not found
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This message may have been deleted, or your endpoint path differs.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-7 space-y-5">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 wrap-break-word">
                {item.title}
              </h1>

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap wrap-break-word text-gray-800 dark:text-gray-100">
                  {item.message || "—"}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}