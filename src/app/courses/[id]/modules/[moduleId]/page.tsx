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
  params: { id: string; moduleid: string };
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

type LessonRow = {
  id: string;
  title: string;
  description?: string;
};

type ModuleDetail = {
  id: string;
  title: string;
  description?: string;
  lessons: LessonRow[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function normalizeModuleFromCurriculum(
  payload: unknown,
  moduleId: string
): { courseTitle?: string; moduleDetail: ModuleDetail | null } {
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

  const foundRaw = rawModules.find((mod: unknown) => {
    const m = isRecord(mod) ? mod : {};
    const id = pickString(m.id, "") || pickString(m.module_id, "");
    return id === moduleId;
  });

  if (!foundRaw) return { courseTitle, moduleDetail: null };

  const found = isRecord(foundRaw) ? foundRaw : {};

  const lessonsRaw = Array.isArray(found.lessons)
    ? found.lessons
    : Array.isArray(found.items)
    ? found.items
    : [];

  const lessons: LessonRow[] = [];
  for (const lessonRaw of lessonsRaw) {
    const l = isRecord(lessonRaw) ? lessonRaw : {};
    const id = pickString(l.id, "") || pickString(l.lesson_id, "");
    if (!id) continue;

    lessons.push({
      id,
      title: pickString(l.title, "") || pickString(l.name, "Lesson"),
      description: pickString(l.description, "") || undefined,
    });
  }

  return {
    courseTitle,
    moduleDetail: {
      id: moduleId,
      title: pickString(found.title, "") || pickString(found.name, "Module"),
      description: pickString(found.description, "") || undefined,
      lessons,
    },
  };
}

export default function ModuleDetailsPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <ModuleDetailsPageInner courseId={params.id} moduleId={params.moduleid} />
    </ProtectedRoute>
  );
}

function ModuleDetailsPageInner({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState<string | undefined>(undefined);
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const fetchModule = useCallback(async () => {
    if (!courseId || !moduleId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInlineError(null);
    setLoading(true);

    try {
      const config: AxiosRequestConfig = { signal: controller.signal };
      const res = await api.get(`/courses/${courseId}/curriculum/`, config);

      const normalized = normalizeModuleFromCurriculum(
        res?.data as unknown,
        moduleId
      );

      if (mountedRef.current) {
        setCourseTitle(normalized.courseTitle);
        setModuleDetail(normalized.moduleDetail);
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "CanceledError" || name === "AbortError") return;

      const msg = getAxiosMessage(err, "Failed to load module");
      ErrorToast(msg, isDark);

      if (mountedRef.current) {
        setModuleDetail(null);
        setInlineError(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [courseId, isDark, moduleId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchModule();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchModule]);

  const headerTitle = useMemo(
    () => moduleDetail?.title || "Module",
    [moduleDetail?.title]
  );

  const lessonCount = moduleDetail?.lessons.length ?? 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 wrap-break-word">
              {courseTitle ? courseTitle : "Course"} • Module
            </p>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 wrap-break-word">
              {headerTitle}
            </h1>

            {moduleDetail?.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
                {moduleDetail.description}
              </p>
            ) : null}

            {!loading && moduleDetail ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link
              href={`/courses/${courseId}/modules`}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              Back to modules
            </Link>

            <button
              type="button"
              onClick={fetchModule}
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
              <span className="sr-only">Loading module</span>
            </div>
          ) : !moduleDetail ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Module not found
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This module id doesn’t exist in{" "}
                <span className="font-mono">/courses/:id/curriculum/</span>.
              </p>
            </div>
          ) : moduleDetail.lessons.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                No lessons in this module
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add lessons to see them here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {moduleDetail.lessons.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                    {l.title}
                  </p>

                  {l.description ? (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                      {l.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      No description provided.
                    </p>
                  )}

                  <div className="mt-3">
                    <Link
                      href={`/dashboard/student/lessons/${l.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                      Open lesson
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          This page intentionally reuses the curriculum endpoint to avoid extra
          backend routes.
        </p>
      </div>
    </main>
  );
}
