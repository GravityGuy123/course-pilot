"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, RefreshCcw } from "lucide-react";
import { MyEnrollment } from "./types/student-dashboard";
import SkeletonCard from "@/components/shared/StudentSkeletonCard";
import EmptyState from "@/components/shared/EmptyState";
import { clamp, safeNumber, timeAgo } from "@/lib/format";
import ProgressBar from "@/components/shared/StudentProgressBar";


export default function MyCoursesCard({
  loading,
  error,
  onRetry,
  enrollments,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  enrollments: MyEnrollment[];
}) {
  return (
    <div className="mt-6 rounded-2xl border p-4 sm:p-6 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">My courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your enrollments and current progress.
          </p>
        </div>

        <Link
          href="/dashboard/student/lessons"
          className="text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hidden items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-foreground- shadow-sm transition hover:bg-muted- sm:inline-flex"
        >
          View lessons
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="sm:col-span-2">
            <EmptyState
              title="Couldn’t load your courses"
              description="Try refreshing the page."
              action={
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Retry
                </button>
              }
            />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState
              title="You haven’t enrolled in any course yet"
              description="Browse available courses and start learning immediately."
              action={
                <Link
                  href="/courses"
                  className="text-violet-600 dark:text-indigo-500 dark:bg-primary bg-white hover:bg-violet-50 dark:hover:bg-violet-600 dark:hover:text-white inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-95"
                >
                  Browse Courses
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        ) : (
          enrollments.map((e) => {
            const pct = clamp(safeNumber(e.progress_percent, 0), 0, 100);
            const status = String(e.status || "").toUpperCase();
            const isActive = status === "ACTIVE";

            return (
              <div
                key={e.id}
                className="group rounded-2xl border bg-background/40 p-4 transition hover:bg-background/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {e.course.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status:{" "}
                      <span className="font-medium text-foreground/90">{status || "—"}</span>
                    </p>
                  </div>

                  <Link
                    href={`/courses/${e.course.id}/modules`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted"
                  >
                    Open
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {e.total_lessons && e.completed_lessons != null
                      ? `${e.completed_lessons}/${e.total_lessons} lessons`
                      : isActive
                        ? "In progress"
                        : "—"}
                  </span>
                  <span>{timeAgo(e.last_activity_at) ?? "—"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 sm:hidden">
        <Link
          href="/dashboard/student/lessons"
          className="text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          View lessons
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}