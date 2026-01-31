"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order: number;
  content: string;
  description?: string;
  video_url?: string;
}

function LessonViewPage() {
  const params = useParams<{ id: string; moduleid: string; lessonid: string }>();
  const courseId = params?.id;
  const moduleId = params?.moduleid;
  const lessonId = params?.lessonid;

  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [uiState, setUiState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchLesson = async () => {
      if (!lessonId) return;

      setUiState("loading");
      setErrorMsg("");

      try {
        const res = await api.get<Lesson>(`/lessons/${lessonId}/`);
        if (!alive) return;

        setLesson(res.data);
        setUiState("ready");
      } catch {
        if (!alive) return;
        setErrorMsg("Failed to load lesson.");
        setUiState("error");
      }
    };

    void fetchLesson();

    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (uiState === "loading") return <p className="p-6 text-gray-500">Loading lesson...</p>;

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">Couldn’t load lesson</h2>
        <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) return <p className="p-6 text-gray-500">Lesson not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {lesson.order}. {lesson.title}
        </h1>

        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/tutor/courses/${courseId}/modules/${moduleId}/lessons`)}
        >
          Back to lessons
        </Button>
      </div>

      {lesson.video_url ? (
        <a
          href={lesson.video_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-violet-600 hover:underline"
        >
          Watch video
        </a>
      ) : null}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        {/* If your content is HTML and you trust it, you can switch back to dangerouslySetInnerHTML */}
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {lesson.content}
        </p>
      </div>
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