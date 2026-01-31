"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, BookOpen, AlertTriangle, RefreshCcw } from "lucide-react";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
}

function ModuleListPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id;

  const [modules, setModules] = useState<Module[]>([]);
  const [uiState, setUiState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    let alive = true;

    const fetchModules = async () => {
      if (!courseId) return;

      setUiState("loading");
      setErrorMsg("");

      try {
        const response = await api.get<Module[]>(`/tutor/courses/${courseId}/modules/`);
        if (!alive) return;

        const list = Array.isArray(response.data) ? response.data : [];
        setModules(list);
        setUiState(list.length === 0 ? "empty" : "ready");
      } catch {
        if (!alive) return;
        setErrorMsg("Failed to load modules. Please try again.");
        setUiState("error");
      }
    };

    void fetchModules();

    return () => {
      alive = false;
    };
  }, [courseId]);

  if (uiState === "loading") {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-500">Loading modules…</p>
      </div>
    );
  }

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Couldn’t load modules</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{errorMsg}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/tutor/courses/${courseId}`)}>
            Back to course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Modules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and organize your course curriculum
          </p>
        </div>

        <Button
          onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/create`)}
          className="bg-violet-600 hover:bg-violet-700 cursor-pointer text-white"
        >
          + Create Module
        </Button>
      </div>

      {/* ---------- EMPTY STATE ---------- */}
      {uiState === "empty" ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-500">No modules yet. Start building your course structure.</p>
        </div>
      ) : (
        /* ---------- MODULE LIST ---------- */
        <div className="grid gap-5 sm:grid-cols-2">
          {modules.map((module) => (
            <div
              key={module.id}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition"
            >
              {/* TITLE */}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {module.order}. {module.title}
                </h3>

                <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  Module
                </span>
              </div>

              {/* DESCRIPTION */}
              {module.description ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{module.description}</p>
              ) : null}

              {/* ACTIONS */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${module.id}`)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                <button
                  onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${module.id}/lessons`)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 transition cursor-pointer"
                  type="button"
                >
                  <BookOpen className="w-4 h-4" />
                  Lessons
                </button>

                <button
                  onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${module.id}/update`)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition cursor-pointer"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${module.id}/delete`)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition cursor-pointer"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModuleListPageContent() {
  return (
    <ProtectedRoute>
      <ModuleListPage />
    </ProtectedRoute>
  );
}