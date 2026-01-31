"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Edit,
  RefreshCcw,
  Trash2,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  module: string; // backend serializer returns module id (UUID) for Lesson.module
  course: string;
  order: number;
  duration_minutes?: number | null;
  is_published?: boolean;
}

function ModuleDetailsPage() {
  const params = useParams<{ id: string; moduleid: string }>();
  const courseId = params?.id;
  const moduleId = params?.moduleid;

  const router = useRouter();

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [uiState, setUiState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchAll = async () => {
      if (!courseId || !moduleId) return;

      setUiState("loading");
      setErrorMsg("");

      try {
        // Module details
        const moduleRes = await api.get<Module>(
          `/tutor/courses/${courseId}/modules/${moduleId}/`
        );

        // Lessons list (backend: "courses/<uuid:course_id>/lessons/")
        const lessonsRes = await api.get<Lesson[]>(`/courses/${courseId}/lessons/`);

        if (!alive) return;

        setModuleData(moduleRes.data ?? null);

        const list = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
        setLessons(list);

        setUiState("ready");
      } catch {
        if (!alive) return;
        setErrorMsg("Failed to load module details. Please try again.");
        setUiState("error");
      }
    };

    void fetchAll();

    return () => {
      alive = false;
    };
  }, [courseId, moduleId]);

  const moduleLessons = useMemo(() => {
    if (!moduleId) return [];
    return lessons
      .filter((l) => String(l.module) === String(moduleId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [lessons, moduleId]);

  if (uiState === "loading") {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-500">Loading module details…</p>
      </div>
    );
  }

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Couldn’t load module
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{errorMsg}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules`)}
          >
            Back to modules
          </Button>
        </div>
      </div>
    );
  }

  const title = moduleData?.title ?? "Module";
  const order = moduleData?.order ?? 0;
  const description = moduleData?.description ?? "";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules`)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {order}. {title}
            </h1>

            {description ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                {description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No description provided for this module.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`)
            }
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Lessons
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() =>
              router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/update`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Module
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() =>
              router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/delete`)
            }
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Lessons preview */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Lessons in this module
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {moduleLessons.length} lesson{moduleLessons.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() =>
                router.push(
                  `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/create`
                )
              }
            >
              + Create Lesson
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`)
              }
            >
              View all
            </Button>
          </div>
        </div>

        {moduleLessons.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500">No lessons yet for this module.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {moduleLessons.slice(0, 6).map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
                  )
                }
                className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lesson {lesson.order ?? "-"}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {lesson.title}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                    Lesson
                  </span>
                </div>
              </button>
            ))}

            {moduleLessons.length > 6 ? (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`
                    )
                  }
                >
                  View remaining lessons ({moduleLessons.length - 6})
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ModuleDetailsPageContent() {
  return (
    <ProtectedRoute>
      <ModuleDetailsPage />
    </ProtectedRoute>
  );
}