"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchPayments } from "@/lib/moderator/api";
import type { ModerationPaymentRow } from "@/lib/moderator/types";
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

function formatMoney(amount: number, currency: string): string {
  const cur = (currency || "").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unknown/invalid currency codes
    return `${amount} ${cur}`.trim();
  }
}

function ModeratorPaymentsPage() {
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);

  const [rows, setRows] = useState<ModerationPaymentRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Prevent stale responses from overwriting newer state
  const requestSeq = useRef(0);

  const cols: Array<Column<ModerationPaymentRow>> = useMemo(
    () => [
      { key: "email", header: "User Email", cell: (p) => <span className="opacity-80">{p.user_email}</span> },
      {
        key: "amount",
        header: "Amount",
        cell: (p) => <span className="font-medium">{formatMoney(p.amount, p.currency)}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (p) => (
          <span className="inline-flex rounded-full px-2 py-0.5 text-xs border capitalize">
            {p.status || "—"}
          </span>
        ),
      },
      { key: "provider", header: "Provider", cell: (p) => <span className="opacity-80">{p.provider || "—"}</span> },
      {
        key: "txn",
        header: "Txn ID",
        cell: (p) => <span className="opacity-70">{p.provider_txn_id || "—"}</span>,
      },
      { key: "created", header: "Created", cell: (p) => <span className="opacity-80">{formatDate(p.created_at)}</span> },
    ],
    []
  );

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;

    setLoading(true);
    setErrMsg(null);

    try {
      const data = await fetchPayments({
        status: status || undefined,
        provider: provider || undefined,
        search: search || undefined,
        page,
        page_size: pageSize,
      });

      if (seq !== requestSeq.current) return; // stale response guard

      setRows(data.results);
      setTotal(data.count);
    } catch (e) {
      if (seq !== requestSeq.current) return;
      setErrMsg(toApiError(e).message);
      setRows([]);
      setTotal(0);
    } finally {
      if (seq !== requestSeq.current) return;
      setLoading(false);
    }
  }, [page, pageSize, provider, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Read-only view for moderators (refunds are admin-only)."
        right={
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setPage(1);
              load();
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition disabled:opacity-50"
          >
            Refresh
          </button>
        }
      />

      <div className="rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label="Payment Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="pending">pending</option>
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
            <option value="refunded">refunded</option>
          </select>

          <input
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
            placeholder="Provider (e.g. paystack)…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search txn id or email…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
          />

          <button
            type="button"
            onClick={() => {
              setStatus("");
              setProvider("");
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
      {!loading && errMsg ? <ErrorState title="Failed to load payments" message={errMsg} onRetry={load} /> : null}
      {!loading && !errMsg && rows.length === 0 ? (
        <EmptyState title="No payments found" message="Try adjusting filters." />
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

export default function ModeratorPaymentsPageContent() {
  return (
    <ProtectedRoute>
      <ModeratorPaymentsPage />
    </ProtectedRoute>
  );
}