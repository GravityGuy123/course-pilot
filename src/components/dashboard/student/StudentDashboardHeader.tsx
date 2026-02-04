"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, RefreshCcw } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

export default function StudentDashboardHeader({
  fullName,
  refreshing,
  loading,
  onRefresh,
}: {
  fullName?: string | null;
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Student Dashboard</p>
        <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Track your learning, continue where you left off, and discover new courses.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="text-violet-600 dark:text-indigo-600 bg-white hover:bg-violet-50 dark:hover:bg-violet-600 dark:hover:text-white inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? <Spinner className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>

        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all duration-300 hover:opacity-95"
        >
          Browse Courses
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}