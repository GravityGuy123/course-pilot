"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, Edit, Eye, RefreshCcw, Trash2 } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order: number;
  description: string; // backend returns "description" mapped from content
  content?: string;
  video_url?: string;
}

function LessonListPage() {
  const params = useParams<{ id: string; moduleid: string }>();
  const courseId = params?.id;
  const moduleId = params?.moduleid;

  const router = useRouter();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [uiState, setUiState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchLessons = async () => {
      if (!courseId || !moduleId) return;

      setUiState("loading");
      setErrorMsg("");

      try {
        const res = await api.get<Lesson[]>(
          `/courses/${courseId}/modules/${moduleId}/lessons/`
        );
        if (!alive) return;

        const list = Array.isArray(res.data) ? res.data : [];
        setLessons(list);
        setUiState(list.length === 0 ? "empty" : "ready");
      } catch {
        if (!alive) return;
        setErrorMsg("Failed to load lessons. Please try again.");
        setUiState("error");
      }
    };

    void fetchLessons();

    return () => {
      alive = false;
    };
  }, [courseId, moduleId]);

  if (uiState === "loading") return <p className="p-6 text-gray-500">Loading lessons...</p>;

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">Couldn’t load lessons</h2>
        <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700 text-white">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage lessons inside this module.</p>
        </div>

        <Button
          onClick={() =>
            router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/create`)
          }
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          + Create Lesson
        </Button>
      </div>

      {uiState === "empty" ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-500">No lessons yet. Create the first one.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {lesson.order}. {lesson.title}
                </h3>

                <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  Lesson
                </span>
              </div>

              {lesson.description ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{lesson.description}</p>
              ) : null}

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/update`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/delete`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
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

export default function LessonListPageContent() {
  return (
    <ProtectedRoute>
      <LessonListPage />
    </ProtectedRoute>
  );
}