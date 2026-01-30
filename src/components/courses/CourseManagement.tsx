"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios.config";

type Lesson = {
  id: string;
  title?: string;
  content?: string;
  video_url?: string | null;
};

type Course = {
  id: string;
  title: string;
  description?: string;
  lessons?: Lesson[];
};

interface CourseManagementProps {
  params: {
    id: string;
  };
}

export default function CourseManagement({ params }: CourseManagementProps) {
  const courseId = params.id;
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
            const res = await api.get(`/tutor/courses/${courseId}`);
        if (!mounted) return;
        setCourse(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [courseId]);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
      const res = await api.post('/tutor/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const addLesson = async () => {
    try {
      let video_url = null;
      if (video) video_url = await uploadFile(video);
  const res = await api.post(`/tutor/courses/${courseId}/lessons/add`, { title, content, video_url });
      setCourse((c: Course | null) => c ? ({ ...c, lessons: [...(c.lessons || []), (res.data as Lesson)] }) : c);
      setTitle(''); setContent(''); setVideo(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add lesson');
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
  await api.delete(`/tutor/lessons/${lessonId}/delete`);
      setCourse((c: Course | null) => c ? ({ ...c, lessons: (c.lessons || []).filter((l) => l.id !== lessonId) }) : c);
    } catch (err) {
      console.error(err);
      alert('Failed');
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVideo, setEditVideo] = useState<File | null>(null);

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditVideo(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      let video_url = undefined;
      if (editVideo) video_url = await uploadFile(editVideo);
      const payload: Record<string, unknown> = { title: editTitle, content: editContent };
      if (video_url) payload.video_url = video_url;
  const res = await api.put(`/tutor/lessons/${editingId}/update`, payload);
      setCourse((c: Course | null) => c ? ({ ...c, lessons: (c.lessons || []).map((ls) => (ls.id === editingId ? (res.data as Lesson) : ls)) }) : c);
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Course: {course.title}</h1>
      {/* Lessons list */}
      <section className="mb-6">
        <h2 className="font-semibold">Lessons</h2>
        <ul className="mt-3 space-y-2">
          {(course.lessons || []).map((l) => (
            <li key={l.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-sm text-gray-600">{String(l.content || '').slice(0,120)}</div>
              </div>
              <div className="space-x-2">
                <a target="_blank" rel="noreferrer" className="text-sm text-violet-600" href={`/courses/${course.id}/lessons/${l.id}`}>Open</a>
                <button className="px-3 py-1 bg-violet-600 text-white rounded" onClick={() => {
                  setEditingId(l.id); setEditTitle(l.title || ''); setEditContent(l.content || '');
                }}>Edit</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => deleteLesson(l.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Add Lesson */}
      <section className="mb-6">
        <h2 className="font-semibold">Add Lesson</h2>
        <div className="mt-3 space-y-3">
          <input placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" />
          <textarea placeholder="Lesson content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border rounded" rows={4}></textarea>
          <label className="block">
            <input type="file" accept="video/*" aria-label="Upload lesson video" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
          </label>
          <div>
            <button onClick={addLesson} className="px-4 py-2 bg-violet-600 text-white rounded">Add Lesson</button>
          </div>
        </div>
      </section>

      {/* Edit Lesson */}
      {editingId && (
        <section className="mb-6">
          <h2 className="font-semibold">Edit Lesson</h2>
          <div className="mt-3 space-y-3">
            <input placeholder="Lesson title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 border rounded" />
            <textarea placeholder="Lesson content" value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-2 border rounded" rows={4}></textarea>
            <label className="block">
              <input type="file" accept="video/*" aria-label="Upload lesson video" onChange={(e) => setEditVideo(e.target.files?.[0] || null)} />
            </label>
            <div className="space-x-2">
              <button onClick={saveEdit} className="px-4 py-2 bg-violet-600 text-white rounded">Save</button>
              <button onClick={cancelEdit} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}