"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
}

function UpdateModulePage() {
  const { id: courseId, moduleid: moduleId } = useParams() as {
    id: string;
    moduleid: string;
  };
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // Fetch module data on mount
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await api.get<Module>(
          `/tutor/courses/${courseId}/modules/${moduleId}` // <-- correct endpoint
        );
        setModule(response.data);
      } catch (error) {
        console.error("Failed to fetch module:", error);
        setMsg("Module not found or an error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [courseId, moduleId]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!module) return;

    setSubmitting(true);
    try {
      await api.patch(
        `/tutor/courses/${courseId}/modules/${moduleId}/update`, // <-- update endpoint
        module
      );
      router.push(`/dashboard/tutor/courses/${courseId}/modules`);
    } catch (error) {
      console.error("Failed to update module:", error);
      setMsg("Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading module…</p>;
  if (!module) return <p className="text-red-500">{msg || "Module not found"}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Update Module
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            aria-label="Module Title"
            type="text"
            value={module.title}
            onChange={(e) =>
              setModule({ ...module, title: e.target.value })
            }
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Order
          </label>
          <input
            aria-label="Module Order"
            type="number"
            value={module.order}
            onChange={(e) =>
              setModule({ ...module, order: Number(e.target.value) })
            }
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            aria-label="Module Description"
            value={module.description}
            onChange={(e) =>
              setModule({ ...module, description: e.target.value })
            }
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-violet-500"
            rows={4}
          />
        </div>

        {msg && <p className="text-sm text-red-500">{msg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-md disabled:opacity-50"
        >
          {submitting ? "Updating..." : "Update Module"}
        </button>
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