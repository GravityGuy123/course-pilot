"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { ErrorToast } from "@/lib/toast";
import { api } from "@/lib/axios.config";
import { useAuth } from "@/context/auth-context";
import type {
  ContinueLearning,
  FeaturedCourse,
  MyEnrollment,
} from "@/components/dashboard/student/types/student-dashboard";
import { clamp, safeNumber, timeAgo } from "@/lib/format";
import StudentDashboardShell from "@/components/dashboard/student/StudentDashboardShell";

type AnyErr = { name?: string; code?: string; message?: string };

function isCanceled(err: unknown): boolean {
  const e = err as AnyErr;
  return e?.name === "CanceledError" || e?.name === "AbortError" || e?.code === "ERR_CANCELED";
}

function getErrMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
}

function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  // ✅ keep theme in a ref so theme changes don't churn callbacks / refetch
  const isDarkRef = useRef(false);
  useEffect(() => {
    isDarkRef.current = theme === "dark";
  }, [theme]);

  const [enrollments, setEnrollments] = useState<MyEnrollment[] | null>(null);
  const [featured, setFeatured] = useState<FeaturedCourse[] | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const isStudent = Boolean(user?.is_student);

  // ✅ FIX: memoize safe arrays so deps are stable
  const enrollmentsSafe = useMemo<MyEnrollment[]>(
    () => enrollments ?? [],
    [enrollments]
  );

  const featuredSafe = useMemo<FeaturedCourse[]>(
    () => featured ?? [],
    [featured]
  );

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

  const lastActivityLabel = useMemo(
    () => continueLearning?.lastActivity ?? "—",
    [continueLearning]
  );

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
          api.get<MyEnrollment[]>("/enrollments/me/", {
            signal: ac.signal,
            timeout: 15000,
          }),
          api.get<FeaturedCourse[]>("/courses/featured/?limit=6", {
            signal: ac.signal,
            timeout: 15000,
          }),
        ]);

        if (!mountedRef.current) return;

        setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
        setFeatured(Array.isArray(featuredRes.data) ? featuredRes.data : []);
      } catch (err: unknown) {
        if (isCanceled(err)) return;
        if (!mountedRef.current) return;

        const message = getErrMessage(err, "Failed to load dashboard.");
        setError(message);
        ErrorToast(message, isDarkRef.current);
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isStudent]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (!isStudent) {
      router.replace("/dashboard");
      return;
    }

    void fetchAll("initial");
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