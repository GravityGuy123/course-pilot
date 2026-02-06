// src/app/dashboard/moderator/courses/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchCourses, moderationUnpublishCourse } from "@/lib/moderator/api";
import type { ModerationCourseRow } from "@/lib/moderator/types";

import PageHeader from "@/components/dashboard/moderator/PageHeader";
import DataTable, { Column } from "@/components/dashboard/moderator/DataTable";
import Pagination from "@/components/dashboard/moderator/Pagination";
import EmptyState from "@/components/dashboard/moderator/EmptyState";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function ModeratorCoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [rows, setRows] = useState<ModerationCourseRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const data = await fetchCourses({
        search: search || undefined,
        status: status || undefined,
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
  }, [page, pageSize, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const unpublish = useCallback(
    async (c: ModerationCourseRow) => {
      const reason = window.prompt("Reason for unpublishing this course? (optional)")?.trim();
      setActingId(c.id);
      setErrMsg(null);
      try {
        await moderationUnpublishCourse(c.id, { reason: reason || undefined });
        await load();
      } catch (e) {
        setErrMsg(toApiError(e).message);
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const cols: Array<Column<ModerationCourseRow>> = useMemo(
    () => [
      { key: "title", header: "Course", cell: (c) => <span className="font-medium">{c.title}</span> },
      { key: "tutor", header: "Tutor", cell: (c) => <span className="opacity-80">{c.tutor_name || "—"}</span> },
      {
        key: "category",
        header: "Category",
        cell: (c) => <span className="opacity-80">{c.category_name || "—"}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (c) => (
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-80">{c.is_published ? "Published" : "Unpublished"}</span>
            <span className="text-xs opacity-70">{c.is_deleted ? "Deleted" : c.is_active ? "Active" : "Inactive"}</span>
          </div>
        ),
      },
      { key: "created", header: "Created", cell: (c) => <span className="opacity-80">{formatDate(c.created_at)}</span> },
      {
        key: "actions",
        header: "Actions",
        cell: (c) => {
          const disabled = actingId === c.id || c.is_deleted || !c.is_published;
          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => unpublish(c)}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted transition disabled:opacity-50"
                title={c.is_deleted ? "Deleted courses cannot be moderated." : !c.is_published ? "Already unpublished." : ""}
              >
                Unpublish
              </button>
            </div>
          );
        },
      },
    ],
    [actingId, unpublish]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Review and monitor course activity (publish state, active state, deleted state)."
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
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title/description…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <select
            aria-label="Status filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="deleted">Deleted</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <SkeletonBlock rows={8} /> : null}
      {!loading && errMsg ? <ErrorState title="Failed to load courses" message={errMsg} onRetry={load} /> : null}
      {!loading && !errMsg && rows.length === 0 ? (
        <EmptyState title="No courses found" message="Try changing the status filter or search term." />
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

export default function ModeratorCoursesPageContent() {
  return (
    <ProtectedRoute>
      <ModeratorCoursesPage />
    </ProtectedRoute>
  );
}