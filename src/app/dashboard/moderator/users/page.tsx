// src/app/dashboard/moderator/users/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchUsers, setUserActive } from "@/lib/moderator/api";
import type { ModerationUserRow, FetchUsersParams } from "@/lib/moderator/types";

import PageHeader from "@/components/dashboard/moderator/PageHeader";
import DataTable, { Column } from "@/components/dashboard/moderator/DataTable";
import Pagination from "@/components/dashboard/moderator/Pagination";
import EmptyState from "@/components/dashboard/moderator/EmptyState";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function roleLabel(u: ModerationUserRow): string {
  const roles: string[] = [];
  if (u.is_student) roles.push("Student");
  if (u.is_tutor) roles.push("Tutor");
  if (u.is_moderator) roles.push("Moderator");
  if (u.is_admin) roles.push("Admin");
  return roles.join(", ") || "—";
}

function AvatarCell({ u }: { u: ModerationUserRow }) {
  const name = u.full_name || u.username || "User";
  const initial = (name.trim()[0] || "U").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {u.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={u.avatar} alt={name} className="h-9 w-9 rounded-full border object-cover" />
      ) : (
        <div className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold opacity-80">
          {initial}
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-medium">{u.full_name || "—"}</span>
        <span className="text-xs opacity-70">{u.email}</span>
      </div>
    </div>
  );
}

// ✅ unions derived from your types file
type RoleFilter = "" | NonNullable<FetchUsersParams["role"]>;
type ActiveFilter = "" | NonNullable<FetchUsersParams["is_active"]>;

function ModeratorUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [isActive, setIsActive] = useState<ActiveFilter>("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<ModerationUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(25);

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);

    try {
      const data = await fetchUsers({
        search: search || undefined,
        role: role === "" ? undefined : role,
        is_active: isActive === "" ? undefined : isActive,
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

  const toggleUser = useCallback(
    async (u: ModerationUserRow) => {
      const nextActive = !u.is_active;
      const reason = window
        .prompt(nextActive ? "Reason for enabling this user? (optional)" : "Reason for disabling this user? (optional)")
        ?.trim();

      setActingId(u.id);
      setErrMsg(null);

      try {
        await setUserActive(u.id, { active: nextActive, reason: reason || undefined });
        await load();
      } catch (e) {
        setErrMsg(toApiError(e).message);
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const cols: Array<Column<ModerationUserRow>> = useMemo(
    () => [
      {
        key: "identity",
        header: "User",
        cell: (u) => <AvatarCell u={u} />,
      },
      {
        key: "username",
        header: "Username",
        cell: (u) => <span className="opacity-80">{u.username}</span>,
      },
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
      {
        key: "actions",
        header: "Actions",
        cell: (u) => {
          const disabled = actingId === u.id || u.is_admin;
          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleUser(u)}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted transition disabled:opacity-50"
                title={u.is_admin ? "Admins cannot be toggled by moderation." : ""}
              >
                {u.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          );
        },
      },
    ],
    [actingId, toggleUser]
  );

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
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <select
            aria-label="Roles"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as RoleFilter);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
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
              setIsActive(e.target.value as ActiveFilter);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
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