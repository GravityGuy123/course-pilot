"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface Lesson {
  id: string;
  title: string;
  order: number;
  description: string;
  content: string;
}

function UpdateLessonPage() {
  const { lessonid } = useParams() as { lessonid: string };
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get<Lesson>(
          `/lessons/${lessonid}`
        );
        setLesson(response.data);
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lesson) return;

    setSubmitting(true);
    try {
      await api.patch(`/lessons/${lessonid}`, lesson);
      router.push(
        `/dashboard/tutor/courses/${lesson.id}/modules/${lessonid}/lessons/${lessonid}`
      );
    } catch (error) {
      console.error("Failed to update lesson:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading lesson...</p>;
  if (!lesson) return <p>Lesson not found</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Update Lesson</h1>
      <label>
        Title:
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
        />
      </label>
      <label>
        Order:
        <input
          type="number"
          value={lesson.order}
          onChange={(e) =>
            setLesson({ ...lesson, order: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Description:
        <textarea
          value={lesson.description}
          onChange={(e) =>
            setLesson({ ...lesson, description: e.target.value })
          }
        />
      </label>
      <label>
        Content (HTML):
        <textarea
          value={lesson.content}
          onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Updating..." : "Update Lesson"}
      </button>
    </form>
  );
}


export default function UpdateLessonPageContent() {
  return (
    <ProtectedRoute>
      <UpdateLessonPage />
    </ProtectedRoute>
  );
}