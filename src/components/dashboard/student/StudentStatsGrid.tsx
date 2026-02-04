"use client";

import React from "react";
import { BookOpen, BookmarkCheck, CalendarClock, Sparkles } from "lucide-react";
import ProgressBar from "@/components/shared/StudentProgressBar";

export default function StudentStatsGrid({
  totalCourses,
  activeCourses,
  completionAvg,
  lastActivityLabel,
}: {
  totalCourses: number;
  activeCourses: number;
  completionAvg: number;
  lastActivityLabel: string;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Enrolled</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalCourses}</p>
          </div>
          <div className="rounded-xl p-2 bg-violet-600 dark:bg-indigo-500">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Active Courses</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{activeCourses}</p>
          </div>
          <div className="rounded-xl p-2 bg-violet-600 dark:bg-indigo-500">
            <BookmarkCheck className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Avg Completion</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{completionAvg}%</p>
          </div>
          <div className="rounded-xl p-2 bg-violet-600 dark:bg-indigo-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-3 bg-violet-600 dark:bg-indigo-500">
          <ProgressBar value={completionAvg} />
        </div>
      </div>

      <div className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Last Activity</p>
            <p className="mt-1 text-base font-semibold text-foreground">{lastActivityLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across your active courses</p>
          </div>
          <div className="rounded-xl p-2 bg-violet-600 dark:bg-indigo-500">
            <CalendarClock className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}