"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios.config";

/* ---------------- TYPES ---------------- */

interface TutorDashboardCourse {
  id: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  price?: number;
  category?: string;
  tutor?: { id: string; full_name: string; username: string };
  student_count?: number;
  is_published?: boolean;
  created_at?: string;
  revenue?: number;
  completionRate?: number;
  image?: string;
}

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function TutorDashboardCoursesTab() {
  const [courses, setCourses] = useState<TutorDashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formatCurrency = (value?: number) =>
    (value ?? 0).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

  const getStatusBadgeClasses = (isPublished?: boolean) => {
    if (isPublished) {
      return `
        bg-gradient-to-r from-indigo-500 to-violet-600
        text-white
        border border-indigo-400/40
        shadow-sm shadow-indigo-500/20
        dark:from-indigo-600 dark:to-violet-700
      `;
    }

    return `
      bg-muted
      text-muted-foreground
      border border-dashed border-border
      dark:bg-gray-700/40
      dark:text-gray-300
    `;
  };

  /* ---------------- FETCH COURSES ---------------- */

  useEffect(() => {
    let alive = true;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ /api/courses/tutor/
        const res = await api.get<TutorDashboardCourse[]>("/courses/tutor/");

        if (alive) setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch tutor courses:", err);
        if (alive) setError("Failed to load courses.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchCourses();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-center mt-10">Loading courses...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (courses.length === 0) return <p className="text-center mt-10">No courses found.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Courses</h2>

        <Button
          variant="ghost"
          className="text-sm gap-1 hover:bg-violet-600 hover:text-white dark:hover:bg-indigo-500"
          onClick={() => router.push("/dashboard/tutor/courses")}
        >
          View all <span aria-hidden>→</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const studentCount = course.student_count ?? 0;
          const revenue = course.revenue ?? course.price ?? 0;
          const completionRate = course.completionRate ?? 0;

          const imageUrl =
            course.image?.startsWith("http")
              ? course.image
              : course.image
              ? `${SERVER_URL}${course.image}`
              : null;

          return (
            <Card
              key={course.id}
              className="dark:bg-gray-800 hover:shadow-lg transition-shadow flex flex-col overflow-hidden"
            >
              {imageUrl && (
                <div className="relative w-full h-40">
                  <Image
                    src={imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {course.category && (
                    <span className="absolute top-2 left-2 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow z-10">
                      {course.category}
                    </span>
                  )}
                </div>
              )}

              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm truncate">{course.title}</h3>

                  <Badge
                    className={`relative flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full ${getStatusBadgeClasses(
                      course.is_published
                    )}`}
                  >
                    {course.is_published && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                    )}
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                {course.level && (
                  <p className="text-xs text-muted-foreground">Level: {course.level}</p>
                )}

                {course.tutor && (
                  <p className="text-xs text-muted-foreground">
                    By <span className="font-medium">{course.tutor.full_name}</span>
                  </p>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {course.description ?? ""}
                </p>

                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {studentCount}
                    </span>

                    <span className="flex items-center gap-1 text-primary font-medium">
                      <BookOpen className="h-4 w-4" />
                      {formatCurrency(revenue)}
                    </span>

                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <BarChart3 className="h-4 w-4" />
                      {completionRate}%
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-violet-600 hover:text-white hover:dark:bg-indigo-500"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="min-w-[140px]">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(`/dashboard/tutor/courses/${course.id}`)}
                      >
                        <Eye className="h-4 w-4" /> View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(`/dashboard/tutor/courses/${course.id}/update`)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(`/dashboard/tutor/courses/${course.id}/analytics`)}
                      >
                        <BarChart3 className="h-4 w-4" /> Analytics
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}