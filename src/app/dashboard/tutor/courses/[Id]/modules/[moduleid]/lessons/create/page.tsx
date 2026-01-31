"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";

type LessonFormData = {
  title: string;
  content: string;
  video_url: string;
  order: number;
  is_published: boolean;
};

function CreateLessonPage() {
  const params = useParams<{ id: string; moduleid: string }>();
  const courseId = params?.id;
  const moduleId = params?.moduleid;

  const router = useRouter();

  const [form, setForm] = useState<LessonFormData>({
    title: "",
    content: "",
    video_url: "",
    order: 1,
    is_published: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !moduleId) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post(`/courses/${courseId}/modules/${moduleId}/lessons/add/`, form);

      router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`);
    } catch {
      setErrorMsg("Failed to create lesson. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Lesson</h1>
        <p className="text-sm text-gray-500 mt-1">Add a lesson inside this module.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6"
      >
        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {errorMsg}
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lesson Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="e.g. What is Cyber Security?"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <textarea
            rows={6}
            required
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Write the lesson content here..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Video URL (optional)</label>
          <input
            type="url"
            value={form.video_url}
            onChange={(e) => setForm((p) => ({ ...p, video_url: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order</label>
            <input
              type="number"
              aria-label="Lesson Order"
              min={1}
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-7">
            <input
              id="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
              className="h-4 w-4"
            />
            <label htmlFor="is_published" className="text-sm text-gray-700 dark:text-gray-300">
              Publish immediately
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg shadow-md"
          >
            {submitting ? "Creating Lesson..." : "Create Lesson"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`)}
            className="px-8 py-3 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateLessonPageContent() {
  return (
    <ProtectedRoute>
      <CreateLessonPage />
    </ProtectedRoute>
  );
}