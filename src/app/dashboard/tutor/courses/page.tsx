"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { AllCoursesPageProps } from "@/lib/types";
import { Clock, Users, BookOpen, RefreshCcw, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

type UiState = "loading" | "ready" | "empty" | "error";

function TutorCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<AllCoursesPageProps[]>([]);
  const [uiState, setUiState] = useState<UiState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchCourses = useCallback(async () => {
    try {
      setUiState("loading");
      setErrorMsg("");

      const res = await api.get<AllCoursesPageProps[]>("/tutor/courses");

      const list = Array.isArray(res.data) ? res.data : [];
      const filtered = list.filter((c) => !c.is_deleted);

      setCourses(filtered);

      if (filtered.length === 0) setUiState("empty");
      else setUiState("ready");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Treat 404 as empty state if your backend uses it for "no tutor courses"
        if (err.response?.status === 404) {
          setCourses([]);
          setUiState("empty");
          return;
        }

        // network / CORS / server unreachable
        if (!err.response) {
          setErrorMsg("Network error. Check your internet connection and try again.");
          setUiState("error");
          return;
        }
      }

      setErrorMsg("Failed to load your courses. Please try again.");
      setUiState("error");
    }
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await fetchCourses();
    })();

    return () => {
      alive = false;
    };
  }, [fetchCourses]);

  const courseCountLabel = useMemo(() => {
    const n = courses.length;
    if (n === 1) return "Awesome Course!";
    return "Awesome Courses!";
  }, [courses.length]);

  const handleViewCourse = (courseId: string) => {
    router.push(`/dashboard/tutor/courses/${courseId}`);
  };

  // ------------------- UI States -------------------
  if (uiState === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-7 w-2/3 max-w-lg bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <RefreshCcw className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Couldn’t load your courses
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {errorMsg || "Something went wrong. Please try again."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={fetchCourses} className="bg-violet-600 hover:bg-violet-700 text-white">
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/tutor")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (uiState === "empty") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          <BookOpen className="h-6 w-6" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          You haven’t created any courses yet
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create your first course and start teaching today.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={fetchCourses} className="bg-violet-600 hover:bg-violet-700 text-white">
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/tutor/courses/new")}>
            Create a course
          </Button>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/tutor/courses/deleted-courses")}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            View Deleted Courses
          </Button>
        </div>
      </div>
    );
  }

  // ------------------- Ready -------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-xl sm:text-2xl font-bold mb-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
        You’re teaching{" "}
        <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg">
          {courses.length}
        </span>
        <span>{courseCountLabel}</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => {
          const imageUrl =
            course.image?.startsWith("http")
              ? course.image
              : course.image
              ? `${SERVER_URL}${course.image}`
              : null;

          const description = course.description ? String(course.description) : "";

          return (
            <div
              key={course.id}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition bg-white dark:bg-gray-900"
            >
              {imageUrl ? (
                <div className="relative h-44 w-full">
                  <Image
                    src={imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {course.category && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                      {course.category}
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-44 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="p-4 space-y-2">
                {course.level && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
                    {course.level}
                  </span>
                )}

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {course.title}
                </h2>

                {course.tutor?.full_name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By <span className="font-medium">{course.tutor.full_name}</span>
                  </p>
                )}

                {description ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No description added yet.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="truncate">{course.duration}</span>
                    </div>
                  )}

                  {course.student_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {course.student_count} {course.student_count < 2 ? "student" : "students"}
                      </span>
                    </div>
                  )}

                  {course.student_count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        course.student_count > 0
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {course.student_count > 0 ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold mt-2 text-gray-900 dark:text-gray-100">
                  ₦{Number(course.price).toLocaleString()}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleViewCourse(course.id)}
                    className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                  >
                    View Course
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/tutor/courses/${course.id}/enroll`)}
                    className="w-full"
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center sm:justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/tutor/courses/deleted-courses")}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          View Deleted Courses
        </Button>
      </div>
    </div>
  );
}


export default function TutorCoursesPageContent() {
  return (
    <ProtectedRoute>
      <TutorCoursesPage />
    </ProtectedRoute>
  );
}