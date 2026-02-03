"use client";

// Student learning view

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast } from "@/lib/toast";
import { ApiErrorPayload } from "@/lib/types";


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

type LessonCard = {
  id: string;
  title: string;
  courseTitle?: string;
  moduleTitle?: string;
  completed?: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickBool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function normalizeLessonsFromEnrollments(payload: unknown): LessonCard[] {
  const root = isRecord(payload) ? payload : {};
  const listRaw = Array.isArray(payload)
    ? payload
    : Array.isArray(root.results)
    ? root.results
    : [];

  const out: LessonCard[] = [];

  for (const enrollmentRaw of listRaw) {
    const e = isRecord(enrollmentRaw) ? enrollmentRaw : {};

    const course = isRecord(e.course) ? e.course : {};
    const curriculum = isRecord(e.curriculum) ? e.curriculum : {};
    const progress = isRecord(e.progress) ? e.progress : {};

    const courseTitle =
      pickString(course.title, "") || pickString(e.course_title, "");

    const modulesRaw = Array.isArray(e.modules)
      ? e.modules
      : Array.isArray(curriculum.modules)
      ? curriculum.modules
      : Array.isArray(course.modules)
      ? course.modules
      : [];

    if (modulesRaw.length > 0) {
      for (const moduleRaw of modulesRaw) {
        const m = isRecord(moduleRaw) ? moduleRaw : {};
        const moduleTitle =
          pickString(m.title, "") || pickString(m.name, "");

        const lessonsRaw = Array.isArray(m.lessons)
          ? m.lessons
          : Array.isArray(m.items)
          ? m.items
          : [];

        for (const lessonRaw of lessonsRaw) {
          const l = isRecord(lessonRaw) ? lessonRaw : {};

          const id = pickString(l.id, "") || pickString(l.lesson_id, "");
          if (!id) continue;

          out.push({
            id,
            title: pickString(l.title, "") || pickString(l.name, "Lesson"),
            courseTitle: courseTitle || undefined,
            moduleTitle: moduleTitle || undefined,
            completed: pickBool(l.completed) ?? pickBool(l.is_completed),
          });
        }
      }
    } else {
      // Fallback: enrollment includes lessons flat
      const lessonsRaw = Array.isArray(e.lessons)
        ? e.lessons
        : Array.isArray(progress.lessons)
        ? progress.lessons
        : [];

      for (const lessonRaw of lessonsRaw) {
        const l = isRecord(lessonRaw) ? lessonRaw : {};
        const moduleObj = isRecord(l.module) ? l.module : {};

        const id = pickString(l.id, "") || pickString(l.lesson_id, "");
        if (!id) continue;

        const moduleTitle =
          pickString(moduleObj.title, "") ||
          pickString(l.module_title, "");

        out.push({
          id,
          title: pickString(l.title, "") || pickString(l.name, "Lesson"),
          courseTitle: courseTitle || undefined,
          moduleTitle: moduleTitle || undefined,
          completed: pickBool(l.completed) ?? pickBool(l.is_completed),
        });
      }
    }
  }

  // De-dup by id (keep first)
  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });
}

export default function StudentLessonsPage() {
  return (
    <ProtectedRoute>
      <StudentLessonsPageInner />
    </ProtectedRoute>
  );
}

function StudentLessonsPageInner() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [query, setQuery] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchLessons = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    try {
      const config: AxiosRequestConfig = { signal: controller.signal };
      const res = await api.get("/enrollments/me/", config);
      const data: unknown = res?.data;

      if (mountedRef.current) {
        setLessons(normalizeLessonsFromEnrollments(data));
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load lessons");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setLessons([]);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isDark]);

  useEffect(() => {
    mountedRef.current = true;
    fetchLessons();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchLessons]);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return lessons;

    return lessons.filter((l) => {
      const a = (l.title || "").toLowerCase();
      const b = (l.courseTitle || "").toLowerCase();
      const c = (l.moduleTitle || "").toLowerCase();
      return a.includes(normalizedQuery) || b.includes(normalizedQuery) || c.includes(normalizedQuery);
    });
  }, [lessons, normalizedQuery]);

  const completedCount = useMemo(() => {
    let count = 0;
    for (const x of filtered) if (x.completed === true) count += 1;
    return count;
  }, [filtered]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Lessons
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Browse lessons from your enrolled courses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {filtered.length}
              </span>{" "}
              lessons •{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {completedCount}
              </span>{" "}
              completed
            </div>

            <button
              type="button"
              onClick={fetchLessons}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </header>

        {inlineError ? (
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {inlineError}
          </div>
        ) : null}

        {/* content */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons, modules, courses..."
              className="w-full sm:max-w-md px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            />

            <Link
              href="/dashboard"
              className="text-sm font-medium text-violet-700 dark:text-violet-400 hover:underline underline-offset-4"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  No lessons found
                </p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                      {l.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 wrap-break-word">
                      {l.courseTitle ?? "Course"}
                      {l.moduleTitle ? ` • ${l.moduleTitle}` : ""}
                    </p>

                    <div className="mt-3">
                      <Link
                        href={`/dashboard/student/lessons/${l.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition"
                      >
                        Open lesson
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}