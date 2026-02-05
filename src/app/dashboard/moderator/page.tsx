"use client";

import { useCallback, useEffect, useState } from "react";
import { toApiError } from "@/lib/axios.config";
import { fetchOverview } from "@/lib/moderator/api";
import type { OverviewStats } from "@/lib/moderator/types";
import PageHeader from "@/components/dashboard/moderator/PageHeader";
import SkeletonBlock from "@/components/dashboard/moderator/SkeletonBlock";
import ErrorState from "@/components/dashboard/moderator/ErrorState";
import StatCards from "@/components/dashboard/moderator/StatCards";
import QuickActions from "@/components/dashboard/moderator/QuickActions";
import RecentActivity from "@/components/dashboard/moderator/RecentActivity";
import { ProtectedRoute } from "@/components/routing/RouteGuard";


function ModeratorDashboardPage() {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetchOverview();
      setData(res);
    } catch (e) {
      const err = toApiError(e);
      setErrMsg(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderator Dashboard"
        subtitle="Monitor CoursePilot activity and handle moderation tasks."
        right={
          <button
            type="button"
            onClick={load}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
          >
            Refresh
          </button>
        }
      />

      {loading ? <SkeletonBlock rows={8} /> : null}

      {!loading && errMsg ? (
        <ErrorState title="Failed to load dashboard" message={errMsg} onRetry={load} />
      ) : null}

      {!loading && data ? (
        <div className="space-y-6">
          <StatCards stats={data} />
          <QuickActions />
          <RecentActivity recent={data.recent} />
        </div>
      ) : null}
    </div>
  );
}


export default function ModeratorDashboardPageContent() {
  return (
    <ProtectedRoute>
      <ModeratorDashboardPage />
    </ProtectedRoute>
  );
}