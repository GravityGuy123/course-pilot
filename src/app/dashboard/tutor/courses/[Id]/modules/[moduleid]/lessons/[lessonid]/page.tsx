"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

interface Lesson {
  id: string;
  title: string;
  order: number;
  description: string;
  content: string;
}

function LessonViewPage() {
  const { lessonid } = useParams() as { lessonid: string };
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading lesson...</p>;
  if (!lesson) return <p>Lesson not found</p>;

  return (
    <div>
      <h1>
        {lesson.order}. {lesson.title}
      </h1>
      <p>{lesson.description}</p>
      <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
    </div>
  );
}


export default function LessonViewPageContent() {
  return (
    <ProtectedRoute>
      <LessonViewPage />
    </ProtectedRoute>
  );
}