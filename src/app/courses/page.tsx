"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { api, authApi } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, RefreshCcw } from "lucide-react";
import { CurrentUser, PublicCourse } from "@/lib/types";


const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

type UiState = "loading" | "ready" | "empty" | "error";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function normalizeCoursesResponse(data: unknown): PublicCourse[] {
  if (Array.isArray(data)) return data as PublicCourse[];

  if (data && typeof data === "object") {
    const maybe = data as Partial<PaginatedResponse<PublicCourse>>;
    if (Array.isArray(maybe.results)) return maybe.results;
  }

  return [];
}

export default function PublicCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [uiState, setUiState] = useState<UiState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // -------- Fetch current user (non-blocking) --------
  useEffect(() => {
    let alive = true;

    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.get<CurrentUser>("/current-user/");
        if (!alive) return;
        setCurrentUser(res.data);
      } catch {
        if (!alive) return;
        setCurrentUser(null);
      }
    };

    void fetchCurrentUser();

    return () => {
      alive = false;
    };
  }, []);

  // -------- Courses fetch (pagination-safe) --------
  const fetchCourses = useCallback(async () => {
    try {
      setUiState("loading");
      setErrorMsg("");

      const res = await api.get("/courses/");
      const list = normalizeCoursesResponse(res.data);

      // filter out soft-deleted courses (defensive)
      const filtered = list.filter((c) => !c.is_deleted);

      setCourses(filtered);
      setUiState(filtered.length === 0 ? "empty" : "ready");
    } catch (err) {
      // If backend returns 404 for "no courses", treat it as empty.
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 404) {
          setCourses([]);
          setUiState("empty");
          return;
        }

        if (!err.response) {
          setErrorMsg("Network error. Check your internet connection and try again.");
          setUiState("error");
          return;
        }
      }

      setErrorMsg("Failed to load courses. Please try again.");
      setUiState("error");
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  const isTutor = useMemo(() => !!currentUser?.is_tutor, [currentUser]);

  // -------- UI states --------
  if (uiState === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 max-w-xl bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
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
          Couldn’t load courses
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {errorMsg || "Something went wrong. Please try again."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={fetchCourses} className="bg-violet-600 hover:bg-violet-700 text-white">
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go Home
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
          No courses available yet
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Check back later, or explore other parts of the platform while we publish new courses.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={fetchCourses} className="bg-violet-600 hover:bg-violet-700 text-white">
            Refresh
          </Button>

          {isTutor ? (
            <Button variant="outline" onClick={() => router.push("/dashboard/tutor/courses/create")}>
              Create a course
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push("/")}>
              Go Home
            </Button>
          )}
        </div>
      </div>
    );
  }

  // uiState === "ready"
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center animate-slide-fade">
        📖 Browse Our Extensive Course Library – Unlock Your Learning Potential!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => {
          const imageUrl = course.image?.startsWith("http")
            ? course.image
            : course.image
            ? `${SERVER_URL}${course.image}`
            : null;

          const isPaid = course.pricing_type === "PAID";

          return (
            <div
              key={course.id}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition bg-white dark:bg-gray-900"
            >
              {imageUrl ? (
                <div className="relative h-44 w-full">
                  <Image src={imageUrl} alt={course.title} fill className="object-cover" unoptimized />
                  {course.category && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                      {course.category}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {isPaid ? "PAID" : "FREE"}
                  </span>
                </div>
              ) : (
                <div className="h-44 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="p-4 space-y-2">
                <span className="inline-block text-xs text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full dark:bg-violet-900/30 dark:text-violet-200">
                  {course.level}
                </span>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {course.title}
                </h2>

                {course.tutor && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By <span className="font-medium">{course.tutor.full_name}</span>
                  </p>
                )}

                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {course.description}
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
                        {course.student_count} {course.student_count === 1 ? "student" : "students"}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {isPaid ? `₦${Number(course.price).toLocaleString()}` : "Free"}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                  >
                    View Course
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${course.id}/enroll`)}
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

      <style jsx>{`
        @keyframes slideFade {
          0% {
            transform: translateY(2rem);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-fade {
          animation: slideFade 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}