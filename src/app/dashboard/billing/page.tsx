// src/app/dashboard/billing/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast } from "@/lib/toast";
import { InvoiceRow, PlanInfo } from "@/lib/types";

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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fmtMoney(value?: number | null, currency = "NGN") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

function fmtDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickNumber(v: unknown): number | null | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function normalizeBilling(payload: unknown): { plan: PlanInfo | null; invoices: InvoiceRow[] } {
  const root = isRecord(payload) ? payload : {};

  // plan: allow multiple shapes
  const planObj = isRecord(root.plan)
    ? root.plan
    : isRecord(root.subscription)
    ? root.subscription
    : isRecord(root.current_plan)
    ? root.current_plan
    : null;

  const plan: PlanInfo | null = planObj
    ? {
        name:
          pickString(planObj.name, "") ||
          pickString(planObj.plan_name, "") ||
          pickString(planObj.title, "") ||
          "Free",
        status:
          pickString(planObj.status, "") ||
          pickString(planObj.state, "") ||
          undefined,
        renews_at:
          pickString(planObj.renews_at, "") ||
          pickString(planObj.renewal_date, "") ||
          pickString(planObj.current_period_end, "") ||
          null,
        amount:
          (pickNumber(planObj.amount) ??
            pickNumber(planObj.price) ??
            pickNumber(planObj.plan_amount)) ??
          null,
        currency:
          pickString(planObj.currency, "") ||
          pickString(planObj.plan_currency, "") ||
          "NGN",
      }
    : null;

  // invoices: allow different keys
  const invoicesRaw = Array.isArray(root.invoices)
    ? root.invoices
    : Array.isArray(root.transactions)
    ? root.transactions
    : Array.isArray(root.payments)
    ? root.payments
    : Array.isArray(root.results)
    ? root.results
    : [];

  const invoices: InvoiceRow[] = [];

  for (let i = 0; i < invoicesRaw.length; i += 1) {
    const r = isRecord(invoicesRaw[i]) ? (invoicesRaw[i] as Record<string, unknown>) : {};
    const id =
      pickString(r.id, "") ||
      pickString(r.invoice_id, "") ||
      pickString(r.reference, "") ||
      String(i + 1);

    const currency = pickString(r.currency, "") || "NGN";

    invoices.push({
      id,
      created_at:
        pickString(r.created_at, "") ||
        pickString(r.created, "") ||
        pickString(r.paid_at, "") ||
        undefined,
      amount:
        (pickNumber(r.amount) ??
          pickNumber(r.total) ??
          pickNumber(r.paid_amount) ??
          pickNumber(r.price)) ??
        null,
      currency,
      status: pickString(r.status, "") || pickString(r.state, "") || undefined,
      receipt_url:
        pickString(r.receipt_url, "") ||
        pickString(r.receiptUrl, "") ||
        pickString(r.receipt, "") ||
        pickString(r.hosted_invoice_url, "") ||
        pickString(r.invoice_url, "") ||
        undefined,
      description:
        pickString(r.description, "") ||
        pickString(r.title, "") ||
        pickString(r.reason, "") ||
        undefined,
    });
  }

  // de-dup by id
  const seen = new Set<string>();
  const deduped = invoices.filter((x) => {
    if (!x.id) return false;
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });

  return { plan, invoices: deduped };
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingPageInner />
    </ProtectedRoute>
  );
}

function BillingPageInner() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchBilling = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    // Try common billing endpoints; first successful wins.
    // Adjust these to match your backend once confirmed.
    const candidates: string[] = [
      "/billing/",
      "/payments/billing/",
      "/payments/history/",
      "/payments/",
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

      const normalized = normalizeBilling(data);

      if (mountedRef.current) {
        setPlan(normalized.plan);
        setInvoices(normalized.invoices);
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load billing details");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setPlan(null);
        setInvoices([]);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isDark]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBilling();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchBilling]);

  const invoiceTotal = useMemo(() => {
    let total = 0;
    for (const inv of invoices) {
      if (typeof inv.amount === "number" && Number.isFinite(inv.amount)) total += inv.amount;
    }
    return total;
  }, [invoices]);

  const currency = plan?.currency || invoices[0]?.currency || "NGN";

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Billing
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage your plan and view payment history.
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
              onClick={fetchBilling}
              disabled={loading}
              className={cx(
                "inline-flex w-full sm:w-auto items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition",
                "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                "disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              )}
            >
              <RefreshCw className={cx("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </header>

        {inlineError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
            {inlineError}
          </div>
        ) : null}

        {/* Content */}
        <section className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Plan card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5 lg:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Current Plan
                  </p>
                </div>
                <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100 wrap-break-word">
                  {plan?.name || "Free"}
                </p>

                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Status:{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {plan?.status || "active"}
                    </span>
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Renews:{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {plan?.renews_at ? fmtDate(plan.renews_at) : "—"}
                    </span>
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Price:{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {fmtMoney(plan?.amount ?? null, plan?.currency || currency)}
                    </span>
                  </p>
                </div>
              </div>

              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            </div>

            <div className="mt-4 grid gap-2">
              <Link
                href="/dashboard/support"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              >
                Need help?
              </Link>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                title="Wire this to your subscription/upgrade flow when ready"
              >
                Upgrade plan (coming soon)
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Tip: Once your backend endpoints are confirmed, update the{" "}
              <span className="font-mono">candidates</span> array in this page to
              match exact routes.
            </p>
          </div>

          {/* Invoices */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:col-span-2 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Payment History
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {invoices.length} invoice{invoices.length === 1 ? "" : "s"} •
                  Total{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {fmtMoney(invoiceTotal, currency)}
                  </span>
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-10 flex items-center justify-center">
                <Spinner />
                <span className="sr-only">Loading billing</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-6 sm:p-8 text-center space-y-2">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  No payments yet
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  When you make payments, they’ll appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {invoices.map((inv) => (
                  <li key={inv.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                          {inv.description || "Payment"}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {fmtDate(inv.created_at)}{" "}
                          {inv.status ? (
                            <>
                              •{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {inv.status}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>

                      <div className="shrink-0 text-right space-y-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {fmtMoney(inv.amount ?? null, inv.currency || currency)}
                        </p>

                        {inv.receipt_url ? (
                          <a
                            href={inv.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline underline-offset-4"
                          >
                            Receipt <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}