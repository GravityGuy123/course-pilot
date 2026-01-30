"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, BookOpen } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
}

export default function ModuleListPage() {
  const { id } = useParams() as { id: string };
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get<Module[]>(
          `/tutor/courses/${id}/modules`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-500">Loading modules…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Modules
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and organize your course curriculum
          </p>
        </div>

        <Button
          onClick={() =>
            router.push(`/dashboard/tutor/courses/${id}/modules/create`)
          }
          className="bg-violet-600 hover:bg-violet-700 cursor-pointer"
        >
          + Create Module
        </Button>
      </div>

      {/* ---------- EMPTY STATE ---------- */}
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-500">
            No modules yet. Start building your course structure.
          </p>
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
              {module.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {module.description}
                </p>
              )}

              {/* ACTIONS: Responsive grid for buttons */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${id}/modules/${module.id}`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${id}/modules/${module.id}/lessons`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Lessons
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${id}/modules/${module.id}/update`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/tutor/courses/${id}/modules/${module.id}/delete`
                    )
                  }
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition cursor-pointer"
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