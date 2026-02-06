// src/app/dashboard/moderator/applications/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchPendingApplications, reviewApplication } from "@/lib/moderator/api";
import type { ModerationApplicationRow, ModerationReviewAction } from "@/lib/moderator/types";

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

// ✅ Typed role filter (no `any`)
type ApplicationRoleFilter = "" | "tutor" | "moderator";

function ModeratorApplicationsPage() {
  const [role, setRole] = useState<ApplicationRoleFilter>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [rows, setRows] = useState<ModerationApplicationRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);

    try {
      const data = await fetchPendingApplications({
        // ✅ no `as any`
        role: role === "" ? undefined : role,
        page,
        page_size: pageSize,
      });

      // Backend doesn't support search on pending list yet.
      // We'll do client-side filtering (safe + simple).
      const filtered = !search
        ? data.results
        : data.results.filter((a) => {
            const n = a.applicant?.full_name || "";
            const e = a.applicant?.email || "";
            const u = a.applicant?.username || "";
            const q = search.toLowerCase();
            return n.toLowerCase().includes(q) || e.toLowerCase().includes(q) || u.toLowerCase().includes(q);
          });

      setRows(filtered);
      setTotal(search ? filtered.length : data.count);
    } catch (e) {
      setErrMsg(toApiError(e).message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, role, search]);

  useEffect(() => {
    load();
  }, [load]);

  const act = useCallback(
    async (id: string, action: ModerationReviewAction) => {
      const reason = window
        .prompt(action === "approve" ? "Reason for approving? (optional)" : "Reason for rejecting? (optional)")
        ?.trim();

      setActingId(id);
      setErrMsg(null);

      try {
        await reviewApplication(id, action, { reason: reason || undefined });
        await load();
      } catch (e) {
        setErrMsg(toApiError(e).message);
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const cols: Array<Column<ModerationApplicationRow>> = useMemo(
    () => [
      {
        key: "applicant",
        header: "Applicant",
        cell: (a) => (
          <div className="flex flex-col">
            <span className="font-medium">{a.applicant?.full_name || a.applicant?.username || "—"}</span>
            <span className="text-xs opacity-70">{a.applicant?.email || "—"}</span>
          </div>
        ),
      },
      { key: "role", header: "Role", cell: (a) => <span className="opacity-80 capitalize">{a.role}</span> },
      {
        key: "submitted",
        header: "Submitted",
        cell: (a) => <span className="opacity-80">{formatDate(a.submitted_at)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        cell: (a) => {
          const disabled = actingId === a.id;
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
        title="Applications (Pending)"
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            aria-label="Application Roles"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as ApplicationRoleFilter);
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
            placeholder="Search applicant name/email/username…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <button
            type="button"
            onClick={() => {
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
        <EmptyState title="No pending applications" message="Try changing the role filter or search term." />
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