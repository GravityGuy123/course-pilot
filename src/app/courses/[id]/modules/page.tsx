"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { useTheme } from "next-themes";

import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorToast } from "@/lib/toast";

type PageProps = {
  params: { id: string };
};

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

type ModuleRow = {
  id: string;
  title: string;
  description?: string;
  lessonCount?: number;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function pickNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function normalizeModules(payload: unknown): {
  courseTitle?: string;
  modules: ModuleRow[];
} {
  const root = isRecord(payload) ? payload : {};

  const courseObj = isRecord(root.course) ? root.course : {};
  const curriculumObj = isRecord(root.curriculum) ? root.curriculum : {};

  const courseTitle =
    pickString(courseObj.title, "") ||
    pickString(root.title, "") ||
    pickString(root.course_title, "") ||
    undefined;

  const rawModules = Array.isArray(root.modules)
    ? root.modules
    : Array.isArray(curriculumObj.modules)
    ? curriculumObj.modules
    : Array.isArray(courseObj.modules)
    ? courseObj.modules
    : [];

  const out: ModuleRow[] = [];

  for (const moduleRaw of rawModules) {
    const m = isRecord(moduleRaw) ? moduleRaw : {};
    const id = pickString(m.id, "") || pickString(m.module_id, "");
    if (!id) continue;

    const lessons = Array.isArray(m.lessons)
      ? m.lessons
      : Array.isArray(m.items)
      ? m.items
      : [];

    const lessonCount =
      lessons.length > 0 ? lessons.length : pickNumber(m.lesson_count);

    out.push({
      id,
      title: pickString(m.title, "") || pickString(m.name, "Module"),
      description: pickString(m.description, "") || undefined,
      lessonCount,
    });
  }

  return { courseTitle, modules: out };
}

export default function CourseModulesPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <CourseModulesPageInner courseId={params.id} />
    </ProtectedRoute>
  );
}

function CourseModulesPageInner({ courseId }: { courseId: string }) {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState<string | undefined>(undefined);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchModules = useCallback(async () => {
    if (!courseId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    try {
      const config: AxiosRequestConfig = { signal: controller.signal };
      const res = await api.get(`/courses/${courseId}/curriculum/`, config);

      const normalized = normalizeModules(res?.data as unknown);

      if (mountedRef.current) {
        setCourseTitle(normalized.courseTitle);
        setModules(normalized.modules);
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load modules");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setModules([]);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [courseId, isDark]);

  useEffect(() => {
    mountedRef.current = true;
    fetchModules();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchModules]);

  const title = useMemo(() => courseTitle || "Course Modules", [courseTitle]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Select a module to view lessons.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Back to course
            </Link>

            <button
              type="button"
              onClick={fetchModules}
              disabled={loading}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
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

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-6">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Spinner />
              <span className="sr-only">Loading modules</span>
            </div>
          ) : modules.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                No modules yet
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                If this course has content, verify your curriculum endpoint response shape.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This page expects <span className="font-mono">/courses/:id/curriculum/</span>.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <Link
                  key={m.id}
                  href={`/courses/${courseId}/modules/${m.id}`}
                  className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words group-hover:text-violet-700 dark:group-hover:text-violet-400">
                        {m.title}
                      </p>

                      {m.description ? (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                          {m.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          No description provided.
                        </p>
                      )}
                    </div>

                    {typeof m.lessonCount === "number" ? (
                      <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {m.lessonCount} lessons
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 text-xs font-semibold text-violet-700 dark:text-violet-400">
                    View module →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}