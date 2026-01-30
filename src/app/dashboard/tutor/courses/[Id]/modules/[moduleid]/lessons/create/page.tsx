"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  order: number;
}

interface ErrorResponse {
  detail?: string;
}

function CreateLessonPage({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const { id, moduleId } = params; // course id
  const router = useRouter();

  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    content: "",
    order: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/lessons/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data: ErrorResponse = await res.json();
        throw new Error(data.detail || "Failed to create lesson");
      }

      router.push(`/dashboard/tutor/courses/${id}/modules/${moduleId}/lessons`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Lesson</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            aria-label="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            aria-label="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            aria-label="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Order</label>
          <input
            aria-label="order"
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            min={1}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Lesson"}
        </button>
      </form>
    </div>
  );
}


export default function CreateLessonPageContent({ params, }: {
  params: { id: string; moduleId: string };}) {

  return (
    <ProtectedRoute>
      <CreateLessonPage params={params} />
    </ProtectedRoute>
  );
};