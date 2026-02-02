import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";

import { api } from "@/lib/axios.config";
import { ErrorToast, SuccessToast } from "@/lib/toast";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
};


function getFirstErrorMessage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
  }

  return null;
}

function formatRelativeDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NotificationsToolbar({ isDark }: { isDark: boolean }) {
  const [markingAll, setMarkingAll] = useState(false);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await api.post("/notifications/read-all/");
      SuccessToast("All notifications marked as read", isDark);
      window.dispatchEvent(new CustomEvent("coursepilot:notifications:refetch"));
    } catch (err) {
      const msg = isAxiosError(err)
        ? getFirstErrorMessage(err.response?.data) || "Failed to mark all as read"
        : "Failed to mark all as read";
      ErrorToast(msg, isDark);
    } finally {
      setMarkingAll(false);
    }
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={markAllRead}
        disabled={markingAll}
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50"
      >
        {markingAll ? "Marking..." : "Mark all read"}
      </button>
    </div>
  );
}

export function NotificationsPanel({ isDark }: { isDark: boolean }) {
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchKey, setRefetchKey] = useState(0);

  const [markingId, setMarkingId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/");
      const data = Array.isArray(res.data) ? res.data : [];
      setNotes(data);
    } catch (err) {
      const msg = isAxiosError(err)
        ? getFirstErrorMessage(err.response?.data) || "Failed to load notifications"
        : "Failed to load notifications";
      ErrorToast(msg, isDark);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [isDark]);

  useEffect(() => {
    void refetch();
  }, [refetchKey, refetch]);

  useEffect(() => {
    const handler = () => setRefetchKey((k) => k + 1);
    window.addEventListener(
      "coursepilot:notifications:refetch",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "coursepilot:notifications:refetch",
        handler as EventListener
      );
  }, []);

  const unreadCount = useMemo(
    () => notes.reduce((acc, n) => acc + (n.is_read ? 0 : 1), 0),
    [notes]
  );

  const markRead = useCallback(
    async (id: string) => {
      setMarkingId(id);
      try {
        await api.post(`/notifications/${id}/read/`);
        setNotes((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_read: true } : p))
        );
      } catch (err) {
        const msg = isAxiosError(err)
          ? getFirstErrorMessage(err.response?.data) || "Failed to mark as read"
          : "Failed to mark as read";
        ErrorToast(msg, isDark);
      } finally {
        setMarkingId(null);
      }
    },
    [isDark]
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-5">
        <div className="space-y-3">
          <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="p-4 sm:p-5">
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            No notifications yet
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            You’ll see updates about enrollments, lessons, and platform activity here.
          </p>
          <button
            type="button"
            onClick={() => setRefetchKey((k) => k + 1)}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {unreadCount > 0 ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {unreadCount}
              </span>{" "}
              unread
            </>
          ) : (
            "All caught up"
          )}
        </p>

        <button
          type="button"
          onClick={() => setRefetchKey((k) => k + 1)}
          className="text-sm font-medium text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded"
        >
          Refresh
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {notes.map((n) => {
          const timeLabel = formatRelativeDate(n.created_at);
          const isUnread = !n.is_read;

          return (
            <li
              key={n.id}
              className={[
                "rounded-xl border p-4 sm:p-5",
                "bg-white dark:bg-gray-900",
                isUnread
                  ? "border-violet-200 dark:border-violet-900/50"
                  : "border-gray-200 dark:border-gray-800",
              ].join(" ")}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    {isUnread ? (
                      <span
                        className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-violet-600 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                        {n.title}
                      </p>
                      {timeLabel ? (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {timeLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 wrap-break-word">
                    {n.message}
                  </p>
                </div>

                {!n.is_read ? (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    disabled={markingId === n.id}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50"
                  >
                    {markingId === n.id ? "Marking..." : "Mark read"}
                  </button>
                ) : (
                  <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 dark:border-gray-800">
                    Read
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
