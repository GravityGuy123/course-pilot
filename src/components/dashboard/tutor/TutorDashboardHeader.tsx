"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TutorDashboardHeader() {
  return (
    <div className="pt-3 sm:pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Tutor Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your courses, publishing status, and student activity.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* View courses */}
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link
              href="/dashboard/tutor/courses"
              className="inline-flex items-center gap-2"
            >
              View courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Create course */}
          <Button
            asChild
            className="w-full sm:w-auto text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Link
              href="/dashboard/tutor/courses/create"
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create course
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}