// src/app/dashboard/moderator/audit-logs/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchAuditLogs } from "@/lib/moderator/api";
import type { ModerationAuditLogRow } from "@/lib/moderator/types";

import PageHeader from "@/components/dashboard/moderator/PageHeader";
import DataTable, { Column } from "@/components/dashboard/moderator/DataTable";
import Pagination from "@/components/dashboard/moderator/Pagination";
import EmptyState from "@/components/dashboard/moderator/EmptyState";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [rows, setRows] = useState<ModerationAuditLogRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const data = await fetchAuditLogs({
        search: search || undefined,
        action: action || undefined,
        target_type: targetType || undefined,
        target_id: targetId || undefined,
        page,
        page_size: pageSize,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch (e) {
      setErrMsg(toApiError(e).message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [action, page, pageSize, search, targetId, targetType]);

  useEffect(() => {
    load();
  }, [load]);

  const cols: Array<Column<ModerationAuditLogRow>> = useMemo(
    () => [
      { key: "when", header: "When", cell: (r) => <span className="opacity-80">{formatDate(r.created_at)}</span> },
      { key: "action", header: "Action", cell: (r) => <span className="font-medium">{r.action}</span> },
      {
        key: "target",
        header: "Target",
        cell: (r) => (
          <div className="flex flex-col">
            <span className="opacity-80">{r.target_type}</span>
            <span className="text-xs opacity-70">{r.target_id}</span>
          </div>
        ),
      },
      {
        key: "actor",
        header: "Actor",
        cell: (r) => (
          <div className="flex flex-col">
            <span className="opacity-80">{r.actor_name || "—"}</span>
            <span className="text-xs opacity-70">{r.actor_email || "—"}</span>
          </div>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        cell: (r) => <span className="opacity-80">{r.reason || "—"}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all moderation actions with reasons and metadata."
        right={
          <button
            type="button"
            onClick={() => {
              setPage(1);
              load();
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Refresh
          </button>
        }
      />

      <div className="rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reason/actor/target…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Action (e.g. course.unpublish)"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <input
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setPage(1);
            }}
            placeholder="Target type (user/course/lesson...)"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <input
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setPage(1);
            }}
            placeholder="Target ID"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setAction("");
              setTargetType("");
              setTargetId("");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition lg:col-span-4"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <SkeletonBlock rows={8} /> : null}
      {!loading && errMsg ? <ErrorState title="Failed to load audit logs" message={errMsg} onRetry={load} /> : null}
      {!loading && !errMsg && rows.length === 0 ? (
        <EmptyState title="No audit logs found" message="Try adjusting filters." />
      ) : null}

      {!loading && !errMsg && rows.length > 0 ? (
        <div className="space-y-4">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

export default function AuditLogsPageContent() {
  return (
    <ProtectedRoute>
      <AuditLogsPage />
    </ProtectedRoute>
  );
}