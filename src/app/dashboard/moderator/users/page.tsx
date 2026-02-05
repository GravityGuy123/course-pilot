"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchUsers } from "@/lib/moderator/api";
import type { AdminUserRow } from "@/lib/moderator/types";
import PageHeader from "@/components/dashboard/moderator/PageHeader";
import DataTable, { Column } from "@/components/dashboard/moderator/DataTable";
import Pagination from "@/components/dashboard/moderator/Pagination";
import EmptyState from "@/components/dashboard/moderator/EmptyState";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import { ProtectedRoute } from "@/components/routing/RouteGuard";


function roleLabel(u: AdminUserRow): string {
  const roles: string[] = [];
  if (u.is_student) roles.push("Student");
  if (u.is_tutor) roles.push("Tutor");
  if (u.is_moderator) roles.push("Moderator");
  if (u.is_admin) roles.push("Admin");
  return roles.join(", ") || "—";
}

function ModeratorUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(25);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const cols: Array<Column<AdminUserRow>> = useMemo(
    () => [
      { key: "name", header: "Name", cell: (u) => <span className="font-medium">{u.full_name}</span> },
      { key: "email", header: "Email", cell: (u) => <span className="opacity-80">{u.email}</span> },
      { key: "username", header: "Username", cell: (u) => <span className="opacity-80">{u.username}</span> },
      {
        key: "roles",
        header: "Roles",
        cell: (u) => <span className="opacity-80">{roleLabel(u)}</span>,
      },
      {
        key: "status",
        header: "Active",
        cell: (u) => (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs border ${u.is_active ? "" : "opacity-70"}`}>
            {u.is_active ? "Active" : "Disabled"}
          </span>
        ),
      },
    ],
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const data = await fetchUsers({
        search: search || undefined,
        role: role || undefined,
        is_active: isActive || undefined,
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
  }, [isActive, page, pageSize, role, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="View users and filter by role and status."
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
            placeholder="Search name/email/username…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
          />

          <select
            aria-label="Roles"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            aria-label="Status"
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRole("");
              setIsActive("");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <SkeletonBlock rows={8} /> : null}

      {!loading && errMsg ? <ErrorState title="Failed to load users" message={errMsg} onRetry={load} /> : null}

      {!loading && !errMsg && rows.length === 0 ? (
        <EmptyState title="No users found" message="Try adjusting your filters or search terms." />
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


export default function ModeratorUsersPageContent() {
  return (
    <ProtectedRoute>
      <ModeratorUsersPage />
    </ProtectedRoute>
  );
}