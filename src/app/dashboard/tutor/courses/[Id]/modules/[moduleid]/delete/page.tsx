"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DeleteModulePage() {
  const { moduleid, id } = useParams() as { moduleid: string; id: string };
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleDelete = async () => {
  //   setDeleting(true);
  //   try {
  //     await axios.delete(`/api/modules/${moduleid}`);
  //     router.push(`/dashboard/tutor/courses/${id}/modules`);
  //   } catch (err: unknown) {
  //     if (axios.isAxiosError(err)) {
  //       setError(err.response?.data?.detail || "Failed to delete module");
  //     } else {
  //       setError("Failed to delete module");
  //     }
  //   } finally {
  //     setDeleting(false);
  //   }
  // };

  const params = useParams();
  const courseId = typeof params?.id === "string" ? params.id : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!moduleid) {
      setError("Invalid module ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.delete(
        `/tutor/courses/${courseId}/modules/${moduleid}/delete`
      );
      // tutor/courses/<uuid:course_id>/modules/<uuid:module_id>/delete
      router.push(`/dashboard/tutor/courses/${id}/modules`);
    } catch {
      setError("Unable to delete this module. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <div className="rounded-2xl border border-red-200/60 dark:border-red-900/50 bg-white dark:bg-gray-900 shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Delete Module
          </h1>
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          You are about to permanently delete this module.
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {" "}
            This action cannot be undone.
          </span>{" "}
          All lessons under it will also be removed.
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition"
          >
            {loading ? "Deleting module..." : "Yes, delete module"}
          </Button>
        </div>
      </div>
    </div>
  );
}
