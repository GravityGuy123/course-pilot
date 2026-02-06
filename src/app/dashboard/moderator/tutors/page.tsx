// src/app/dashboard/moderator/tutors/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchTutors, setTutorPublishingFreeze } from "@/lib/moderator/api";
import type { TutorListRow, FetchTutorsParams } from "@/lib/moderator/types";

import PageHeader from "@/components/dashboard/moderator/PageHeader";
import DataTable, { Column } from "@/components/dashboard/moderator/DataTable";
import Pagination from "@/components/dashboard/moderator/Pagination";
import EmptyState from "@/components/dashboard/moderator/EmptyState";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function TutorStatusPill({ frozen }: { frozen: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs border ${frozen ? "opacity-80" : ""}`}>
      {frozen ? "Publishing Frozen" : "Publishing OK"}
    </span>
  );
}

// ✅ unions derived from your types file
type ActiveFilter = "" | NonNullable<FetchTutorsParams["active"]>;
type FrozenFilter = "" | NonNullable<FetchTutorsParams["frozen"]>;

function ModeratorsTutorsPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<ActiveFilter>("");
  const [frozen, setFrozen] = useState<FrozenFilter>("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [rows, setRows] = useState<TutorListRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);

    try {
      const data = await fetchTutors({
        page,
        page_size: pageSize,
        search: search || undefined,
        active: active === "" ? undefined : active,
        frozen: frozen === "" ? undefined : frozen,
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
  }, [page, pageSize, search, active, frozen]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFreeze = useCallback(
    async (t: TutorListRow) => {
      setActingId(t.id);
      setErrMsg(null);

      try {
        const nextFrozen = !t.tutor_publishing_frozen;

        const reason = window
          .prompt(
            nextFrozen ? "Reason for freezing this tutor’s publishing?" : "Reason for unfreezing this tutor’s publishing?"
          )
          ?.trim();

        await setTutorPublishingFreeze(t.id, {
          frozen: nextFrozen,
          reason: reason || undefined,
        });

        await load();
      } catch (e) {
        setErrMsg(toApiError(e).message);
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const cols: Array<Column<TutorListRow>> = useMemo(
    () => [
      {
        key: "name",
        header: "Tutor",
        cell: (t) => (
          <div className="flex flex-col">
            <span className="font-medium">{t.full_name || t.username}</span>
            <span className="text-xs opacity-70">{t.email}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (t) => (
          <div className="flex flex-col gap-1">
            <span className={`text-xs ${t.is_active ? "" : "opacity-70"}`}>{t.is_active ? "Active" : "Disabled"}</span>
            <TutorStatusPill frozen={t.tutor_publishing_frozen} />
          </div>
        ),
      },
      {
        key: "courses",
        header: "Courses",
        cell: (t) => (
          <div className="flex flex-col text-xs opacity-80">
            <span>Total: {t.courses_total}</span>
            <span>Published: {t.courses_published}</span>
            <span>Unpublished: {t.courses_unpublished}</span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (t) => {
          const disabled = actingId === t.id;
          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleFreeze(t)}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted transition disabled:opacity-50"
              >
                {t.tutor_publishing_frozen ? "Unfreeze Publishing" : "Freeze Publishing"}
              </button>
            </div>
          );
        },
      },
    ],
    [actingId, toggleFreeze]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutors"
        subtitle="Monitor tutors, review activity, and freeze/unfreeze publishing."
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
            aria-label="Active"
            value={active}
            onChange={(e) => {
              setActive(e.target.value as ActiveFilter);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>

          <select
            aria-label="Frozen"
            value={frozen}
            onChange={(e) => {
              setFrozen(e.target.value as FrozenFilter);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All</option>
            <option value="true">Frozen</option>
            <option value="false">Not frozen</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActive("");
              setFrozen("");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <SkeletonBlock rows={8} /> : null}
      {!loading && errMsg ? <ErrorState title="Failed to load tutors" message={errMsg} onRetry={load} /> : null}
      {!loading && !errMsg && rows.length === 0 ? <EmptyState title="No tutors found" message="Try adjusting filters." /> : null}

      {!loading && !errMsg && rows.length > 0 ? (
        <div className="space-y-4">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

export default function ModeratorTutorsPage() {
  return (
    <ProtectedRoute>
      <ModeratorsTutorsPage />
    </ProtectedRoute>
  );
}