"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/axios.config';
import { Lesson } from '@/lib/types';

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.id;
  const lessonId = params?.lesson;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        if (!mounted) return;
        setLesson(res.data);
      } catch (e) {
        setMsg('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [lessonId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!lesson) return <div className="p-4">Lesson not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
      <div className="text-gray-700 mb-4">{lesson.content}</div>
      {lesson.video_url && (
        <div className="mb-4">
          <video width="100%" controls src={lesson.video_url}></video>
        </div>
      )}

      <div>
        <div className="text-sm text-gray-600">Mark this lesson complete when you finish it (requires enrollment)</div>
        <div className="mt-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={async () => {
              setMsg(null);
              try {
                // Resolve enrollment by fetching user's enrollments and finding one for this course
                type Enrollment = { id: string; course: { id: string; title?: string }; progress?: number };
                const enrollRes = await api.get('/my-enrollments');
                const enrollments: Enrollment[] = enrollRes.data || [];
                const enrollment = enrollments.find((e) => e.course && String(e.course.id) === String(courseId));
                if (!enrollment) {
                  setMsg('You are not enrolled in this course. Please enroll first.');
                  return;
                }
                const enrollmentId = enrollment.id;
                const res = await api.post(`/enrollments/${enrollmentId}/lessons/${lessonId}/complete`);
                setMsg(res.data?.detail || 'Lesson marked complete');
              } catch (err) {
                let message = 'Failed to mark complete';
                if (err && typeof err === 'object') {
                  const e = err as Record<string, unknown>;
                  const response = e['response'];
                  if (response && typeof response === 'object') {
                    const resp = response as Record<string, unknown>;
                    const data = resp['data'];
                    if (data && typeof data === 'object' && 'detail' in (data as Record<string, unknown>)) {
                      message = String((data as Record<string, unknown>)['detail']);
                    }
                  }
                  if (message === 'Failed to mark complete' && 'message' in e) message = String(e['message']);
                }
                setMsg(message);
              }
            }}
          >
            Mark complete
          </button>
        </div>
        {msg && <div className="mt-2 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
