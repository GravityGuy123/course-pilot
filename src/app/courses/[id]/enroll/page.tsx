// src/app/courses/[id]/enroll/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api, authApi, toApiError } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

type UiState = "loading" | "ready" | "error";

interface TutorInfo {
  id: string;
  full_name: string;
  username: string;
}

interface CourseDetails {
  id: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  price: number;
  image?: string | null;
  student_count?: number;
  category?: string | null;
  tutor?: TutorInfo | null;
}

function trimTrailingSlash(url: string) {
  if (!url) return url;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveMediaUrl(baseUrl: string, maybePath?: string | null) {
  if (!maybePath) return null;
  if (maybePath.startsWith("http")) return maybePath;
  
  const cleanBase = trimTrailingSlash(baseUrl);
  const needsSlash = !maybePath.startsWith("/");
  return `${cleanBase}${needsSlash ? "/" : ""}${maybePath}`;
}

export default function EnrollPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params?.id;

  const SERVER_URL = useMemo(() => trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"),
    []
  );

  const [uiState, setUiState] = useState<UiState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------------------
  // Code block: FETCH COURSE DETAILS (uses api)
  // ----------------------------
  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setUiState("loading");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.get<CourseDetails>(`/courses/${courseId}/`);
      setCourse(res.data);
      setUiState("ready");
    } catch (err) {
      const apiErr = toApiError(err);

      // Optional: tailor a friendlier message for some statuses
      if (apiErr.status === 404) {
        setErrorMsg("This course does not exist or is no longer available.");
      } else if (apiErr.status === 403) {
        setErrorMsg("You don’t have permission to view this course.");
      } else {
        setErrorMsg(apiErr.message);
      }

      setUiState("error");
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  // ----------------------------
  // Code block: ENROLL ACTION (uses authApi)
  // ----------------------------
  const handleEnroll = useCallback(async () => {
    if (!courseId) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Keep this if your backend expects CSRF endpoint to be hit before unsafe methods
      await authApi.get("/csrf/");

      // POST enroll
      await authApi.post(`/courses/${courseId}/enroll/`, {});

      setSuccessMsg("Enrollment successful! Redirecting…");

      window.setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 700);
    } catch (err) {
      const apiErr = toApiError(err);

      // if not logged in, go login
      if (apiErr.status === 401) {
        router.push(`/auth/login?next=/courses/${courseId}/enroll`);
        return;
      }

      // For “already enrolled” your backend likely returns 400 with detail/message
      // toApiError already extracts that cleanly.
      setErrorMsg(apiErr.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [courseId, router]);

  // ----------------------------
  // Code block: LOADING UI
  // ----------------------------
  if (uiState === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 max-w-xl bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 border rounded-2xl overflow-hidden">
              <div className="h-60 bg-gray-200 dark:bg-gray-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="lg:col-span-2 border rounded-2xl p-5 space-y-3">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Code block: ERROR UI
  // ----------------------------
  if (uiState === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Couldn’t load enrollment page
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {errorMsg || "Something went wrong."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={fetchCourse}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>

          <Button variant="outline" onClick={() => router.push("/courses")}>
            Back to courses
          </Button>
        </div>
      </div>
    );
  }

  // uiState === "ready"
  const imageUrl = resolveMediaUrl(SERVER_URL, course?.image);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Code block: HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200 px-3 py-1 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Secure Enrollment
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Confirm your enrollment
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review the course details and enroll when you’re ready.
        </p>
      </div>

      {/* Code block: MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: course preview */}
        <div className="lg:col-span-3 border rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
          <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={course?.title || "Course image"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
            )}

            {course?.category ? (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                {course.category}
              </span>
            ) : null}
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              {course?.level ? (
                <span className="inline-block text-xs text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full dark:bg-violet-900/30 dark:text-violet-200">
                  {course.level}
                </span>
              ) : null}

              {course?.tutor?.full_name ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  By <span className="font-medium">{course.tutor.full_name}</span>
                </span>
              ) : null}
            </div>

            <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {course?.title}
            </h2>

            {course?.description ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {course.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                No description provided for this course yet.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-600 dark:text-gray-300">
              {course?.duration ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              ) : null}

              {typeof course?.student_count === "number" ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {course.student_count}{" "}
                    {course.student_count === 1 ? "student" : "students"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: checkout/enroll card */}
        <div className="lg:col-span-2 border rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-5 h-fit">
          {/* Code block: PRICE */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ₦{Number(course?.price || 0).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Course ID</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {course?.id}
              </p>
            </div>
          </div>

          {/* Code block: ALERTS */}
          {errorMsg ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {errorMsg}
            </div>
          ) : null}

          {successMsg ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
              {successMsg}
            </div>
          ) : null}

          {/* Code block: ACTION BUTTONS */}
          <div className="mt-5 space-y-3">
            <Button
              onClick={handleEnroll}
              disabled={isSubmitting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? "Enrolling…" : "Enroll now"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/courses/${courseId}`)}
              className="w-full"
            >
              Back to course
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/courses")}
              className="w-full"
            >
              Browse other courses
            </Button>
          </div>

          {/* Code block: FOOTER NOTE */}
          <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            By enrolling, you’ll get access to course content based on your account permissions.
            If you’re not logged in, you’ll be redirected to sign in.
          </div>
        </div>
      </div>
    </div>
  );
}