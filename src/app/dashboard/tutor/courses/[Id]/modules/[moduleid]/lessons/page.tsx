"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, bootstrapCsrf } from "@/lib/axios.config";

interface Lesson {
  id: string;
  title: string;
  order: number;
  description: string;
}

export default function LessonListPage() {
  const { id, moduleid } = useParams() as { id: string; moduleid: string };
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await bootstrapCsrf();
        const res = await api.get<Lesson[]>(
          `/courses/${id}/modules/${moduleid}/lessons/`
        );
        if (alive) setLessons(res.data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, moduleid]);

  if (loading) return <p>Loading lessons...</p>;

  return (
    <div>
      <h1>Lessons</h1>
      <button
        onClick={() =>
          router.push(`/dashboard/tutor/courses/${id}/modules/${moduleid}/lessons/create`)
        }
      >
        Create Lesson
      </button>

      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <strong>
              {lesson.order}. {lesson.title}
            </strong>
            <p>{lesson.description}</p>

            <button
              onClick={() =>
                router.push(`/dashboard/tutor/courses/${id}/modules/${moduleid}/lessons/${lesson.id}`)
              }
            >
              View
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/tutor/courses/${id}/modules/${moduleid}/lessons/${lesson.id}/update`)
              }
            >
              Edit
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/tutor/courses/${id}/modules/${moduleid}/lessons/${lesson.id}/delete`)
              }
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
