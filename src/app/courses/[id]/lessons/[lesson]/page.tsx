"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, toApiError } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { Lesson } from "@/lib/types";

type EnrollmentListItem = {
  id: string;
  course: { id: string; title?: string };
  progress?: number;
  status?: string; // if your serializer includes it later
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string; lesson: string }>();
  const courseId = params?.id;
  const lessonId = params?.lesson;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canRender = useMemo(() => Boolean(courseId && lessonId), [courseId, lessonId]);

  useEffect(() => {
    if (!canRender) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        // UX guard (not security): ensure user is enrolled before showing lesson.
        // Real security must be enforced by backend too.
        const enrollRes = await api.get<EnrollmentListItem[]>("/enrollments/me/");
        const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
        const enrollment = enrollments.find((e) => String(e.course?.id) === String(courseId));

        if (!enrollment) {
          setMsg("You are not enrolled in this course. Please enroll first.");
          setLesson(null);
          setLoading(false);
          return;
        }

        // Fetch lesson content
        const res = await api.get<Lesson>(`/lessons/${lessonId}/`);
        if (!mounted) return;
        setLesson(res.data);
      } catch (err) {
        if (!mounted) return;
        const apiErr = toApiError(err);
        if (apiErr.status === 401) {
          router.push(`/login?next=/courses/${courseId}/lessons/${lessonId}`);
          return;
        }
        setMsg(apiErr.message || "Failed to load lesson");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [canRender, courseId, lessonId, router]);

  const handleMarkComplete = async () => {
    if (!courseId || !lessonId) return;

    setActionLoading(true);
    setMsg(null);

    try {
      // Find enrollment for this course
      const enrollRes = await api.get<EnrollmentListItem[]>("/enrollments/me/");
      const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      const enrollment = enrollments.find((e) => String(e.course?.id) === String(courseId));

      if (!enrollment) {
        setMsg("You are not enrolled in this course. Please enroll first.");
        return;
      }

      // Must match Django URL (trailing slash)
      const res = await api.post(
        `/enrollments/${enrollment.id}/lessons/${lessonId}/complete/`,
        {}
      );

      setMsg(res.data?.detail || "Lesson marked complete ✅");
    } catch (err) {
      const apiErr = toApiError(err);
      if (apiErr.status === 401) {
        router.push(`/login?next=/courses/${courseId}/lessons/${lessonId}`);
        return;
      }
      setMsg(apiErr.message || "Failed to mark complete");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-4">Loading…</div>;
  }

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-semibold">Lesson not available</p>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {msg || "Lesson not found."}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => router.push(`/courses/${courseId}`)}>
              Back to course
            </Button>
            <Button variant="outline" onClick={() => router.push(`/courses/${courseId}/enroll`)}>
              Enroll
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // NOTE: You earlier mentioned not leaking video_url to students.
  // That must be handled by backend. This UI will display video_url if it exists.
  // If your backend later hides it, this will automatically stop showing the video.
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            Lesson
          </div>
        </div>

        {lesson.content ? (
          <div className="mt-4 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
            {lesson.content}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No content for this lesson yet.
          </div>
        )}

        {lesson.video_url ? (
          <div className="mt-6">
            <video className="w-full rounded-xl" controls src={lesson.video_url}></video>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Mark this lesson complete
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                This requires an active enrollment.
              </p>

              <div className="mt-3">
                <Button
                  onClick={handleMarkComplete}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? "Saving…" : "Mark complete"}
                </Button>
              </div>

              {msg ? <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{msg}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}