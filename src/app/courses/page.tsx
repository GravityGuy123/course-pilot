"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api, authApi } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";

interface PublicCourse {
  id: string;
  title: string;
  description?: string;
  level: string;
  price: number;
  duration?: string;
  image?: string | null;
  student_count?: number;
  category: string;
  tutor?: {
    id: string;
    full_name: string;
    username: string;
  };
  is_deleted?: boolean;
  is_active?: boolean;
}

interface CurrentUser {
  id: string;
  is_tutor: boolean;
}

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function PublicCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.get<CurrentUser>("/current-user/");
        if (alive) setCurrentUser(res.data);
      } catch {
        if (alive) setCurrentUser(null);
      }
    };

    fetchCurrentUser();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get<PublicCourse[]>("/courses/");
        const filtered = res.data.filter((c) => !c.is_deleted);

        if (alive) {
          setCourses(filtered);
          setError(null);
        }
      } catch {
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-slide-fade">
        📖 Browse Our Extensive Course Library – Unlock Your Learning Potential!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const imageUrl = course.image?.startsWith("http")
            ? course.image
            : course.image
            ? `${SERVER_URL}${course.image}`
            : null;

          return (
            <div
              key={course.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {imageUrl && (
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
              )}

              <div className="p-4 space-y-2">
                <span className="inline-block text-xs text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                  {course.level}
                </span>

                <h2 className="text-lg font-semibold">{course.title}</h2>

                {course.tutor && (
                  <p className="text-xs text-gray-500">
                    By <span className="font-medium">{course.tutor.full_name}</span>
                  </p>
                )}

                {course.description && (
                  <p className="text-sm text-gray-600">
                    {course.description.slice(0, 100)}...
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                  )}
                  {course.student_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.student_count}{" "}
                      {course.student_count === 1 ? "student" : "students"}
                    </div>
                  )}

                  {course.is_active !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        course.is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {course.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold mt-2">
                  ₦{Number(course.price).toLocaleString()}
                </p>

                <div className="flex gap-3 mt-3 flex-wrap">
                  <Button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    View Course
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${course.id}/enroll`)}
                    className="flex-1"
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