"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchApplications, reviewApplication } from "@/lib/moderator/api";
import type { AdminApplicationRow, ReviewAction } from "@/lib/moderator/types";
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

function ModeratorApplicationsPage() {
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [rows, setRows] = useState<AdminApplicationRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const data = await fetchApplications({
        status: status || undefined,
        role: role || undefined,
        search: search || undefined,
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
  }, [page, pageSize, role, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = useCallback(
    async (id: string, action: ReviewAction) => {
      setActingId(id);
      setErrMsg(null);
      try {
        await reviewApplication(id, action);
        await load();
      } catch (e) {
        setErrMsg(toApiError(e).message);
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const cols: Array<Column<AdminApplicationRow>> = useMemo(
    () => [
      {
        key: "applicant",
        header: "Applicant",
        cell: (a) => (
          <div className="flex flex-col">
            <span className="font-medium">{a.applicant_name}</span>
            <span className="text-xs opacity-70">{a.applicant_email}</span>
          </div>
        ),
      },
      { key: "role", header: "Role", cell: (a) => <span className="opacity-80 capitalize">{a.role}</span> },
      {
        key: "status",
        header: "Status",
        cell: (a) => (
          <span className="inline-flex rounded-full px-2 py-0.5 text-xs border capitalize">
            {a.status}
          </span>
        ),
      },
      {
        key: "submitted",
        header: "Submitted",
        cell: (a) => <span className="opacity-80">{formatDate(a.submitted_at)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        cell: (a) => {
          const disabled = actingId === a.id || a.status !== "pending";
          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => act(a.id, "approve")}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted transition disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => act(a.id, "reject")}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          );
        },
      },
    ],
    [act, actingId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        subtitle="Review Tutor/Moderator applications."
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
          <select
            aria-label="Application Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            aria-label="Application Roles"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Roles</option>
            <option value="tutor">Tutor</option>
            <option value="moderator">Moderator</option>
          </select>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search applicant email/name…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <button
            type="button"
            onClick={() => {
              setStatus("");
              setRole("");
              setSearch("");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <SkeletonBlock rows={8} /> : null}

      {!loading && errMsg ? <ErrorState title="Failed to load applications" message={errMsg} onRetry={load} /> : null}

      {!loading && !errMsg && rows.length === 0 ? (
        <EmptyState title="No applications found" message="Try adjusting your filters." />
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


export default function ModeratorApplicationsPageContent() {
  return (
    <ProtectedRoute>
      <ModeratorApplicationsPage />
    </ProtectedRoute>
  );
}