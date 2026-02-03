"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, RefreshCcw, Sparkles } from "lucide-react";
import { FeaturedCourse } from "./types/student-dashboard";
import SkeletonCard from "@/components/shared/StudentSkeletonCard";
import EmptyState from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/format";


export default function FeaturedCoursesCard({
  loading,
  error,
  onRetry,
  featured,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  featured: FeaturedCourse[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">Featured courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Handpicked courses you can start today.
          </p>
        </div>

        <Sparkles className="h-5 w-5 text-foreground/70" />
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <EmptyState
            title="Couldn’t load featured courses"
            description="Try refreshing."
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
        ) : featured.length === 0 ? (
          <EmptyState
            title="No featured courses right now"
            description="Check back later or browse all courses."
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
        ) : (
          featured.map((c) => {
            const isFree = c.pricing_type === "FREE" || c.price === 0;
            const priceLabel = isFree ? "Free" : formatCurrency(c.currency || "NGN", c.price);

            return (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="group block rounded-2xl border bg-background/40 p-4 transition hover:bg-background/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground group-hover:underline">
                      {c.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.category} • {c.level}
                      {c.duration ? ` • ${c.duration}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
                    {priceLabel}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.tutor?.full_name ? `By ${c.tutor.full_name}` : "CoursePilot"}</span>
                  <span className="inline-flex items-center gap-1">
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-4">
        <Link
          href="/courses"
          className="text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          Explore all courses
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}