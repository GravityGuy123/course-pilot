"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface ModuleForm {
  title: string;
  order: number;
  description: string;
}

function CreateModulePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [form, setForm] = useState<ModuleForm>({
    title: "",
    order: 1,
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post( `/tutor/courses/${id}/modules/add`, form);
      router.push(`/dashboard/tutor/courses/${id}/modules`);
    } catch (error) {
      console.error("Failed to create module:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Create New Module
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new module to structure your course content.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6"
      >
        {/* Module Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Module Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Introduction to Cyber Security"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Module Order */}
        <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:w-32">
            Module Order
          </label>

          <div className="space-y-1 flex-1">
            <input
              aria-label="module order"
              type="number"
              min={1}
              value={form.order}
              onChange={(e) =>
                setForm({
                  ...form,
                  order: Number(e.target.value),
                })
              }
              className="w-full md:w-40 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500">
              Determines the position of this module in the course.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            rows={5}
            placeholder="Briefly describe what this module covers..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg shadow-md"
          >
            {submitting ? "Creating Module..." : "Create Module"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                `/dashboard/tutor/courses/${id}/modules`
              )
            }
            className="px-8 py-3 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}


export default function CreateModulePageContent() {
  return (
    <ProtectedRoute>
      <CreateModulePage />
    </ProtectedRoute>
  );
}