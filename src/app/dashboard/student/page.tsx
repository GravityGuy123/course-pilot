"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { ErrorToast } from "@/lib/toast";
import { api } from "@/lib/axios.config";
import { useAuth } from "@/context/auth-context";
import { ContinueLearning, FeaturedCourse, MyEnrollment } from "@/components/dashboard/student/types/student-dashboard";
import { clamp, safeNumber, timeAgo } from "@/lib/format";
import StudentDashboardShell from "@/components/dashboard/student/StudentDashboardShell";
import { useTheme } from "next-themes";


function StudentDashboardPage() {
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<MyEnrollment[] | null>(null);
  const [featured, setFeatured] = useState<FeaturedCourse[] | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const isStudent = Boolean(user?.is_student);

  const enrollmentsSafe = enrollments ?? [];
  const featuredSafe = featured ?? [];

  const totalCourses = useMemo(() => enrollmentsSafe.length, [enrollmentsSafe]);

  const activeCourses = useMemo(() => {
    return enrollmentsSafe.filter((e) => String(e.status).toUpperCase() === "ACTIVE").length;
  }, [enrollmentsSafe]);

  const completionAvg = useMemo(() => {
    if (enrollmentsSafe.length === 0) return 0;
    const sum = enrollmentsSafe.reduce((acc, e) => acc + safeNumber(e.progress_percent, 0), 0);
    return Math.round(sum / enrollmentsSafe.length);
  }, [enrollmentsSafe]);

  const continueLearning: ContinueLearning | null = useMemo(() => {
    const sorted = [...enrollmentsSafe]
      .filter((e) => String(e.status).toUpperCase() === "ACTIVE")
      .sort((a, b) => {
        const ta = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
        const tb = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
        return tb - ta;
      });

    if (sorted.length === 0) return null;

    const pick = sorted[0];
    const pct = clamp(safeNumber(pick.progress_percent, 0), 0, 100);

    return {
      enrollmentId: pick.id,
      courseId: pick.course.id,
      title: pick.course.title,
      image: pick.course.image ?? null,
      progressPercent: pct,
      completedLessons: safeNumber(pick.completed_lessons, 0),
      totalLessons: safeNumber(pick.total_lessons, 0),
      nextLessonId: pick.next_lesson_id ?? null,
      nextLessonTitle: pick.next_lesson_title ?? null,
      lastActivity: timeAgo(pick.last_activity_at),
    };
  }, [enrollmentsSafe]);

  const lastActivityLabel = useMemo(() => continueLearning?.lastActivity ?? "—", [continueLearning]);

  const fetchAll = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!isStudent) return;

      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);

      setError(null);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const [enrollRes, featuredRes] = await Promise.all([
          api.get<MyEnrollment[]>("/enrollments/me/", { signal: ac.signal }),
          api.get<FeaturedCourse[]>("/courses/featured/?limit=6", { signal: ac.signal }),
        ]);

        setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
        setFeatured(Array.isArray(featuredRes.data) ? featuredRes.data : []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message ?? "Failed to load dashboard.")
            : "Failed to load dashboard.";

        setError(message);
        ErrorToast(message, isDark);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isStudent, isDark]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (!isStudent) {
      router.replace("/dashboard");
      return;
    }

    void fetchAll("initial");

    return () => {
      abortRef.current?.abort();
    };
  }, [authLoading, user, isStudent, router, fetchAll]);

  const onRefresh = useCallback(() => {
    void fetchAll("refresh");
  }, [fetchAll]);

  const onRetry = onRefresh;

  return (
    <StudentDashboardShell
      fullName={user?.full_name ?? null}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={onRefresh}
      onRetry={onRetry}
      totalCourses={totalCourses}
      activeCourses={activeCourses}
      completionAvg={completionAvg}
      lastActivityLabel={lastActivityLabel}
      continueLearning={continueLearning}
      enrollments={enrollmentsSafe}
      featured={featuredSafe}
    />
  );
}

export default function StudentDashboardPageContent() {
  return (
    <ProtectedRoute>
      <StudentDashboardPage />
    </ProtectedRoute>
  );
}