"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, RefreshCcw } from "lucide-react";
import { ContinueLearning } from "./types/student-dashboard";
import SkeletonCard from "@/components/shared/StudentSkeletonCard";
import EmptyState from "@/components/shared/EmptyState";
import ProgressBar from "@/components/shared/StudentProgressBar";


export default function ContinueLearningCard({
  loading,
  error,
  onRetry,
  continueLearning,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  continueLearning: ContinueLearning | null;
}) {
  return (
    <div className="rounded-2xl border p-4 sm:p-6 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">Continue learning</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump back in and keep your streak going.
          </p>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <EmptyState
            title="We couldn’t load your dashboard"
            description="Check your connection and try again."
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
        ) : continueLearning ? (
          <div className="rounded-2xl border bg-background/40 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="mt-1 line-clamp-2 text-lg font-semibold text-foreground">
                  {continueLearning.title}
                </p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {continueLearning.progressPercent}%
                    </span>
                  </div>
                  <ProgressBar value={continueLearning.progressPercent} />

                  <p className="text-xs text-muted-foreground">
                    {continueLearning.totalLessons > 0
                      ? `${continueLearning.completedLessons}/${continueLearning.totalLessons} lessons completed`
                      : "Progress tracking is enabled for this course"}
                  </p>

                  {continueLearning.nextLessonTitle ? (
                    <p className="text-sm text-foreground/90">
                      Next up:{" "}
                      <span className="font-medium text-foreground">
                        {continueLearning.nextLessonTitle}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Link
                  href={`/courses/${continueLearning.courseId}/modules`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 sm:w-auto"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href={`/courses/${continueLearning.courseId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted sm:w-auto"
                >
                  View course
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No active courses yet"
            description="Enroll in a course to see your learning progress here."
            action={
              <Link
                href="/courses"
                className="text-violet-600 dark:text-indigo-500 dark:bg-primary bg-white hover:bg-violet-50 dark:hover:bg-violet-600 dark:hover:text-white  inline-flex items-center justify-center gap-2 rounded-xl bg-primary- px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-95"
              >
                Browse Courses
                <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}