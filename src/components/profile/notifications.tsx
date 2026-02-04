"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AxiosError, AxiosRequestConfig } from "axios";

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

type AnyErr = { name?: string; code?: string; message?: string };

function isCanceled(err: unknown): boolean {
  const e = err as AnyErr;
  return (
    e?.name === "CanceledError" ||
    e?.name === "AbortError" ||
    e?.code === "ERR_CANCELED"
  );
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickBoolean(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  created_at?: string;
  read?: boolean;
  type?: string;
};

function normalizeNotification(raw: unknown, idFallback: string): NotificationItem {
  const r = isRecord(raw) ? raw : {};

  const id =
    pickString(r.id, idFallback) ||
    pickString(r.notification_id, idFallback) ||
    pickString(r.notificationId, idFallback) ||
    idFallback;

  const title = pickString(r.title, "Notification");

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

function extractList(payload: unknown): unknown[] {
  // Accept:
  // - []
  // - { results: [] }
  // - { data: [] }
  // - { data: { results: [] } }
  if (Array.isArray(payload)) return payload;

  if (!isRecord(payload)) return [];

  const results = payload.results;
  if (Array.isArray(results)) return results;

  const data = payload.data;
  if (Array.isArray(data)) return data;

  if (isRecord(data) && Array.isArray(data.results)) return data.results;

  return [];
}

function formatWhen(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

/**
 * Shared tiny store (module scope) so Toolbar can trigger refresh without prop drilling.
 * This avoids wiring state through the Profile page.
 */
type Controls = {
  refresh: () => void;
  toggleUnreadOnly: () => void;
  markAllRead: () => void;
  unreadOnly: boolean;
  loading: boolean;
  count: number;
  unreadCount: number;
};

let controls: Controls | null = null;
function setControls(next: Controls | null) {
  controls = next;
}
function getControls() {
  return controls;
}

export function NotificationsToolbar({ isDark }: { isDark: boolean }) {
  const [, force] = useState(0);

  // keep UI reactive when panel updates controls
  useEffect(() => {
    const t = window.setInterval(() => force((x) => x + 1), 400);
    return () => window.clearInterval(t);
  }, []);

  const c = getControls();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => c?.toggleUnreadOnly()}
        disabled={!c || c.loading}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
        title="Show only unread"
      >
        {c?.unreadOnly ? "Showing: Unread" : "Showing: All"}
      </button>

      <button
        type="button"
        onClick={() => c?.refresh()}
        disabled={!c || c.loading}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
      >
        Refresh
      </button>

      <button
        type="button"
        onClick={() => c?.markAllRead()}
        disabled={!c || c.loading || (c.unreadCount ?? 0) === 0}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-60"
      >
        Mark all read{typeof c?.unreadCount === "number" ? ` (${c.unreadCount})` : ""}
      </button>

      {/* Small counts */}
      <div className="text-xs text-gray-500 dark:text-gray-400 sm:ml-2">
        {c ? (
          <>
            <span className="font-medium">{c.count}</span> total ·{" "}
            <span className="font-medium">{c.unreadCount}</span> unread
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}


export function NotificationsPanel({ isDark }: { isDark: boolean }) {
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    setError(null);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const config: AxiosRequestConfig = {
      signal: controller.signal,
      timeout: 15000,
    };

    try {
      const endpoints = ["/notifications/", "/notifications/me/"];

      let data: unknown = null;
      let lastErr: unknown = null;

      for (const url of endpoints) {
        try {
          const res = await api.get(url, config);
          data = res?.data;
          break;
        } catch (e) {
          // ✅ IMPORTANT: if this failed because we aborted, stop immediately.
          if (isCanceled(e)) return;
          lastErr = e;
        }
      }

      if (!mountedRef.current) return;

      if (data === null) {
        // ✅ don’t show "cancelled" as an error
        if (isCanceled(lastErr)) return;

        const msg = getAxiosMessage(lastErr, "Failed to load notifications");
        setError(msg);
        ErrorToast(msg, isDark);
        setItems([]);
        return;
      }

      const list = extractList(data);
      const normalized = list.map((raw, idx) => normalizeNotification(raw, String(idx)));

      normalized.sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });

      setItems(normalized);
    } catch (err: unknown) {
      // ✅ silence all cancel variants
      if (isCanceled(err)) return;
      if (!mountedRef.current) return;

      const msg = getAxiosMessage(err, "Failed to load notifications");
      setError(msg);
      ErrorToast(msg, isDark);
      setItems([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isDark]);

  const markAllRead = useCallback(async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      try {
        await api.post("/notifications/read-all/");
      } catch {
        for (const n of items) {
          if (n.read === true) continue;

          try {
            await api.post(`/notifications/${n.id}/read/`);
          } catch {
            await api.patch(`/notifications/${n.id}/`, { read: true });
          }
        }
      }

      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      SuccessToast("All notifications marked as read", isDark);
    } catch (err: unknown) {
      if (isCanceled(err)) return;

      const msg = getAxiosMessage(err, "Could not mark all as read");
      setError(msg);
      ErrorToast(msg, isDark);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isDark, items]);

  const toggleUnreadOnly = useCallback(() => {
    setUnreadOnly((v) => !v);
  }, []);

  const visible = useMemo(() => {
    if (!unreadOnly) return items;
    return items.filter((n) => n.read !== true);
  }, [items, unreadOnly]);

  const unreadCount = useMemo(() => items.filter((n) => n.read !== true).length, [items]);

  useEffect(() => {
    setControls({
      refresh: fetchNotifications,
      toggleUnreadOnly,
      markAllRead,
      unreadOnly,
      loading,
      count: items.length,
      unreadCount,
    });

    return () => {
      setControls(null);
    };
  }, [fetchNotifications, toggleUnreadOnly, markAllRead, unreadOnly, loading, items.length, unreadCount]);

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchNotifications]);

  return (
    <div className="p-4 sm:p-5">
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <Spinner />
          <span className="sr-only">Loading notifications</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-sm text-gray-600 dark:text-gray-300">
          {unreadOnly ? "No unread notifications." : "No notifications yet."}{" "}
          <Link
            href="/dashboard/inbox"
            className="text-violet-700 dark:text-violet-400 font-medium hover:underline underline-offset-4"
          >
            Open inbox
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 sm:p-5 transition ${
                n.read
                  ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  : "border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-900/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/inbox/${n.id}`}
                      className="font-semibold text-gray-900 dark:text-gray-100 hover:underline underline-offset-4 wrap-break-word"
                    >
                      {n.title || "Notification"}
                    </Link>

                    {n.type ? (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {n.type}
                      </span>
                    ) : null}

                    {typeof n.read === "boolean" ? (
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                          n.read
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                        }`}
                      >
                        {n.read ? "Read" : "Unread"}
                      </span>
                    ) : null}
                  </div>

                  {n.created_at ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatWhen(n.created_at)}
                    </p>
                  ) : null}

                  <p className="mt-3 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap wrap-break-word">
                    {n.message || "—"}
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/dashboard/inbox/${n.id}`}
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}