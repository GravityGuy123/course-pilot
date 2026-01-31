"use client";

import { useEffect, useState } from "react";
import { authApi, toApiError } from "@/lib/axios.config";
import { Enrollment } from "@/lib/types";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { Button } from "@/components/ui/button";
import { BookOpen, RefreshCcw } from "lucide-react";
import Link from "next/link";

function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchEnrollments = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // Your Django URL: path("enrollments/me/", ...)
      const res = await authApi.get<Enrollment[]>("/enrollments/me/");
      setEnrollments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const apiErr = toApiError(err);
      setErrorMsg(apiErr.message || "Failed to load enrollments.");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEnrollments();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  if (enrollments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">No enrollments yet</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enroll in a course to start learning.
          </p>

          {errorMsg ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-300">{errorMsg}</p>
          ) : null}

          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={fetchEnrollments} className="bg-violet-600 hover:bg-violet-700 text-white">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Enrollments</h1>

      <ul className="space-y-4">
        {enrollments.map((e) => (
          <li key={e.id} className="p-4 border rounded-2xl bg-white dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{e.course.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Progress: {Number(e.progress || 0).toFixed(2)}%
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href={`/courses/${e.course.id}`}>View course</a>
                </Button>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white" asChild>
                  <a href={`/courses/${e.course.id}`}>Continue</a>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EnrollmentsPageContent() {
  return (
    <ProtectedRoute>
      <EnrollmentsPage />
    </ProtectedRoute>
  );
}