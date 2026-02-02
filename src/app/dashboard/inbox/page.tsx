// src/app/dashboard/inbox/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";

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

  const id = pickString(r.id, idFallback) || idFallback;
  const title = pickString(r.title, "Message");
  const message =
    pickString(r.message, "") || pickString(r.body, "") || pickString(r.content, "");

  const created_at =
    pickString(r.created_at, "") ||
    pickString(r.createdAt, "") ||
    pickString(r.created, "") ||
    "";

  const read = pickBoolean(r.read) ?? pickBoolean(r.is_read) ?? pickBoolean(r.isRead);

  const type =
    pickString(r.type, "") || pickString(r.category, "") || pickString(r.kind, "");

  return {
    id,
    title,
    message,
    created_at: created_at || undefined,
    read,
    type: type || undefined,
  };
}

function normalizeInboxList(payload: unknown): InboxItem[] {
  // Accept: []
  // Accept: { results: [] } / { data: [] } / { items: [] } / { notifications: [] }
  // Accept: { inbox: [] }
  const root = isRecord(payload) ? payload : {};
  const listRaw = Array.isArray(payload)
    ? payload
    : Array.isArray(root.results)
    ? root.results
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.notifications)
    ? root.notifications
    : Array.isArray(root.inbox)
    ? root.inbox
    : [];

  const out: InboxItem[] = [];

  for (let i = 0; i < listRaw.length; i += 1) {
    const raw = listRaw[i];
    const fallbackId = String(i + 1);
    const item = normalizeInboxItem(raw, fallbackId);

    // Ensure we don't keep "fake" ids if payload actually had none.
    // If id looks like our fallback and there is no title/message, skip.
    if (!item.id || (!item.title && !item.message)) continue;

    out.push(item);
  }

  // De-dup by id (keep first)
  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });
}

function fmtDate(s?: string): string {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
}

function clipPreview(text: string, max = 120): string {
  const t = (text || "").trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`;
}

export default function InboxPage() {
  return (
    <ProtectedRoute>
      <InboxPageInner />
    </ProtectedRoute>
  );
}

function InboxPageInner() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [items, setItems] = useState<InboxItem[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchInbox = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    // Try common list endpoints; first successful wins.
    const candidates: string[] = [
      "/notifications/",
      "/notifications/inbox/",
      "/inbox/",
    ];

    try {
      let data: unknown = null;
      let lastErr: unknown = null;

      for (const url of candidates) {
        try {
          const config: AxiosRequestConfig = { signal: controller.signal };
          const res = await api.get(url, config);
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

      const normalized = normalizeInboxList(data);

      if (mountedRef.current) {
        setItems(normalized);
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load inbox");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setItems([]);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isDark]);

  const markAllRead = useCallback(async () => {
    if (busy || items.length === 0) return;

    setBusy(true);
    setInlineError(null);

    // Only attempt for unread items
    const unread = items.filter((x) => x.read !== true);

    try {
      // Try a bulk endpoint first (if your backend has it)
      try {
        await api.post("/notifications/read-all/");
        if (mountedRef.current) {
          setItems((prev) => prev.map((x) => ({ ...x, read: true })));
        }
        SuccessToast("All messages marked as read", isDark);
        return;
      } catch {
        // Fallback: mark individually (best-effort)
      }

      for (const msg of unread) {
        try {
          await api.post(`/notifications/${msg.id}/read/`);
        } catch {
          try {
            await api.patch(`/notifications/${msg.id}/`, { read: true });
          } catch {
            // ignore individual failures
          }
        }
      }

      if (mountedRef.current) {
        setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      }
      SuccessToast("All messages marked as read", isDark);
    } catch (err: unknown) {
      const msg = getAxiosMessage(err, "Could not mark all as read");
      ErrorToast(msg, isDark);
      if (mountedRef.current) setInlineError(msg);
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [busy, isDark, items]);

  useEffect(() => {
    mountedRef.current = true;
    fetchInbox();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchInbox]);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const unreadCount = useMemo(() => {
    let c = 0;
    for (const x of items) if (x.read !== true) c += 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;

    if (tab === "unread") list = list.filter((x) => x.read !== true);
    if (tab === "read") list = list.filter((x) => x.read === true);

    if (!normalizedQuery) return list;

    return list.filter((x) => {
      const a = (x.title || "").toLowerCase();
      const b = (x.message || "").toLowerCase();
      const c = (x.type || "").toLowerCase();
      return (
        a.includes(normalizedQuery) ||
        b.includes(normalizedQuery) ||
        c.includes(normalizedQuery)
      );
    });
  }, [items, normalizedQuery, tab]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Inbox
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View and manage your notifications.
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
              onClick={fetchInbox}
              disabled={loading || busy}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={markAllRead}
              disabled={busy || loading || unreadCount === 0}
              // aria-disabled={busy || loading || unreadCount === 0}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              {busy ? "Working..." : "Mark all read"}
            </button>
          </div>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full sm:max-w-md px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {items.length}
                </span>{" "}
                • Unread{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {unreadCount}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                tab === "all"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                tab === "unread"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Unread
            </button>

            <button
              type="button"
              onClick={() => setTab("read")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                tab === "read"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Read
            </button>
          </div>
        </section>

        {/* Inline error */}
        {inlineError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
            {inlineError}
          </div>
        ) : null}

        {/* List */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          {loading ? (
            <div className="p-10 flex items-center justify-center">
              <Spinner />
              <span className="sr-only">Loading inbox</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 sm:p-8 text-center space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                No messages
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/dashboard/inbox/${m.id}`}
                    className="block p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                            {m.title || "Message"}
                          </p>

                          {typeof m.read === "boolean" ? (
                            <span
                              className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                                m.read
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                  : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                              }`}
                            >
                              {m.read ? "Read" : "Unread"}
                            </span>
                          ) : null}

                          {m.type ? (
                            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {m.type}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 wrap-break-word">
                          {clipPreview(m.message, 140) || "—"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {fmtDate(m.created_at)}
                        </p>
                        {!m.read ? (
                          <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-violet-600" />
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}