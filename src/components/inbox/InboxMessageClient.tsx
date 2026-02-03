"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";

import { api } from "@/lib/axios.config";
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

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function isUuid(v: string): boolean {
  return UUID_RE.test((v || "").trim());
}

function normalizeInboxItem(raw: unknown, idFallback: string): InboxItem {
  const unwrapped = (() => {
    if (!isRecord(raw)) return raw;

    const data = raw.data;
    if (isRecord(data)) return data;

    const result = raw.result;
    if (isRecord(result)) return result;

    return raw;
  })();

  const r = isRecord(unwrapped) ? unwrapped : {};

  const id =
    pickString(r.id, idFallback) ||
    pickString(r.notification_id, idFallback) ||
    pickString(r.notificationId, idFallback) ||
    idFallback;

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
    pickBoolean(r.isRead) ??
    (typeof r.is_read === "boolean" ? r.is_read : undefined) ??
    (typeof r.isRead === "boolean" ? r.isRead : undefined);

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

type AnyErr = { name?: string; code?: string; message?: string };

function isCanceled(err: unknown): boolean {
  const e = err as AnyErr;
  return (
    e?.name === "CanceledError" ||
    e?.name === "AbortError" ||
    e?.code === "ERR_CANCELED"
  );
}

function isTimeout(err: unknown): boolean {
  const e = err as AnyErr;
  if (e?.code === "ECONNABORTED") return true;
  const msg = (e?.message || "").toLowerCase();
  return msg.includes("timeout") || msg.includes("timed out");
}

export default function InboxMessageClient({ id }: { id: string }) {
  const router = useRouter();
  const { theme } = useTheme();

  // Use ref so theme changes don't trigger refetch loops
  const isDarkRef = useRef(false);
  useEffect(() => {
    isDarkRef.current = theme === "dark";
  }, [theme]);

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InboxItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // ✅ prevents fetch loop & lets us check “do we already have data?”
  const itemRef = useRef<InboxItem | null>(null);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const safeId = useMemo(() => (id || "").trim(), [id]);
  const isValidId = useMemo(() => isUuid(safeId), [safeId]);

  const displayDate = useMemo(() => {
    if (!item?.created_at) return "";
    const d = new Date(item.created_at);
    return Number.isNaN(d.getTime()) ? item.created_at : d.toLocaleString();
  }, [item?.created_at]);

  const canMarkRead = useMemo(() => {
    if (!item) return false;
    if (busy) return false;
    return item.read !== true;
  }, [busy, item]);

  // ✅ IMPORTANT: fetchItem does NOT depend on `item` (prevents “spam calls”)
  const fetchItem = useCallback(async () => {
    setInlineError(null);
    setLoading(true);

    if (!safeId) {
      setItem(null);
      setInlineError("Missing message id");
      setLoading(false);
      return;
    }

    if (!isValidId) {
      setItem(null);
      setInlineError("Invalid message id");
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `/notifications/${safeId}/`;
      const config: AxiosRequestConfig = {
        signal: controller.signal,
        timeout: 15000,
      };

      const res = await api.get(url, config);

      if (!mountedRef.current) return;

      setItem(normalizeInboxItem(res?.data, safeId));
      setInlineError(null);
    } catch (err: unknown) {
      if (!mountedRef.current) return;

      // canceled requests should be silent
      if (isCanceled(err)) return;

      // timeout: only show inline error if we don't already have data displayed
      if (isTimeout(err)) {
        if (!itemRef.current) {
          setInlineError("Request timed out. Please try again.");
        }
        ErrorToast("Request timed out. Please try again.", isDarkRef.current);
        return;
      }

      const msg = getAxiosMessage(err, "Failed to load message");

      // if we already have a message shown, don’t wipe it; just show error
      if (!itemRef.current) setItem(null);
      setInlineError(msg);
      ErrorToast(msg, isDarkRef.current);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isValidId, safeId]);

  const markAsRead = useCallback(async () => {
    const current = itemRef.current;
    if (!current) return;
    if (!isValidId) return;
    if (busy) return;
    if (current.read === true) return;

    setBusy(true);
    setInlineError(null);

    try {
      try {
        await api.post(`/notifications/${current.id}/read/`);
      } catch {
        await api.patch(`/notifications/${current.id}/`, { read: true });
      }

      if (mountedRef.current) {
        setItem((prev) => (prev ? { ...prev, read: true } : prev));
      }
      SuccessToast("Marked as read", isDarkRef.current);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      if (isCanceled(err)) return;

      if (isTimeout(err)) {
        setInlineError("Request timed out. Please try again.");
        ErrorToast("Request timed out. Please try again.", isDarkRef.current);
        return;
      }

      const msg = getAxiosMessage(err, "Could not mark as read");
      setInlineError(msg);
      ErrorToast(msg, isDarkRef.current);
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [busy, isValidId]);

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
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
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
                This message may have been deleted, you don’t have permission, or the id is invalid.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-7 space-y-4">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 wrap-break-word">
                  {item.title}
                </h1>

                {displayDate ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {displayDate}
                  </p>
                ) : null}
              </div>

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