"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi, bootstrapCsrf } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
}

function UpdateModulePage() {
  const params = useParams<{ id: string; moduleid: string }>();
  const courseId = params?.id;
  const moduleId = params?.moduleid;

  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [uiState, setUiState] = useState<"loading" | "ready" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchModule = async () => {
      if (!courseId || !moduleId) return;

      setUiState("loading");
      setMsg("");

      try {
        const response = await authApi.get<Module>(`/tutor/courses/${courseId}/modules/${moduleId}/`);
        if (!alive) return;

        setModule(response.data);
        setUiState("ready");
      } catch {
        if (!alive) return;
        setMsg("Module not found or an error occurred.");
        setUiState("error");
      }
    };

    void fetchModule();

    return () => {
      alive = false;
    };
  }, [courseId, moduleId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId || !moduleId || !module) return;

    setSubmitting(true);
    setMsg("");

    try {
      await bootstrapCsrf();
      await authApi.patch(`/tutor/courses/${courseId}/modules/${moduleId}/update/`, module);
      router.push(`/dashboard/tutor/courses/${courseId}/modules`);
    } catch {
      setMsg("Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (uiState === "loading") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-500">Loading module…</p>
      </div>
    );
  }

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Couldn’t load module</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{msg}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules`)}>
            Back to modules
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Update Module</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            aria-label="Module Title"
            type="text"
            value={module?.title || ""}
            onChange={(e) => setModule((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500 bg-transparent"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order</label>
          <input
            aria-label="Module Order"
            type="number"
            min={1}
            value={module?.order ?? 1}
            onChange={(e) => setModule((prev) => (prev ? { ...prev, order: Number(e.target.value) } : prev))}
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500 bg-transparent"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            aria-label="Module Description"
            value={module?.description || ""}
            onChange={(e) => setModule((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500 bg-transparent"
            rows={4}
          />
        </div>

        {msg ? <p className="text-sm text-red-500">{msg}</p> : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {submitting ? "Updating..." : "Update Module"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function UpdateModulePageContent() {
  return (
    <ProtectedRoute>
      <UpdateModulePage />
    </ProtectedRoute>
  );
}