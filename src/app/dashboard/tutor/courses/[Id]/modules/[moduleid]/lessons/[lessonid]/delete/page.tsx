"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import axios from "axios";

export default function DeleteLessonPage() {
  const { lessonid } = useParams() as { lessonid: string };
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/lessons/${lessonid}`);
      router.push("/dashboard/tutor/courses");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Failed to delete lesson");
      } else {
        setError("Failed to delete lesson");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1>Delete Lesson</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Are you sure you want to delete this lesson? This action cannot be
        undone.
      </p>
      <button onClick={handleDelete} disabled={deleting}>
        {deleting ? "Deleting..." : "Yes, Delete"}
      </button>
      <button onClick={() => router.back()}>Cancel</button>
    </div>
  );
}
