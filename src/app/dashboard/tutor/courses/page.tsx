"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { AllCoursesPageProps } from "@/lib/types";
import { Clock, Users } from "lucide-react";

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function TutorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<AllCoursesPageProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tutor/courses");
        // Only include non-deleted courses
        setCourses(res.data.filter((c: AllCoursesPageProps) => !c.is_deleted));
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleViewCourse = (courseId: string) => {
    router.push(`/dashboard/tutor/courses/${courseId}`);
  };

  if (loading) return <p className="text-center mt-10">Loading courses...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (courses.length === 0)
    return <p className="text-center mt-10">No courses found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* CATCHY TITLE WITH INLINE COURSE COUNT */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        You’re teaching{" "}
        <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-lg">
          {courses.length}
        </span>
         {courses.length === 1 ? "Awesome Course!" : "Awesome Courses!"}
      </h1>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const imageUrl =
            course.image?.startsWith("http")
              ? course.image
              : course.image
              ? `${SERVER_URL}${course.image}`
              : null;

          return (
            <div
              key={course.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition relative"
            >
              {/* IMAGE + CATEGORY BADGE */}
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
                    <span className="absolute top-3 left-3 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                      {course.category}
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 space-y-2">
                {/* LEVEL BADGE */}
                {course.level && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 mb-1">
                    {course.level}
                  </span>
                )}

                <h2 className="text-lg font-semibold">{course.title}</h2>

                {/* TUTOR */}
                {course.tutor && (
                  <p className="text-xs text-gray-500">
                    By <span className="font-medium">{course.tutor.full_name}</span>
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  {course.description.slice(0, 100)}...
                </p>

                {/* DURATION + STUDENT COUNT + STATUS */}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {course.duration}
                    </div>
                  )}
                  {course.student_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {course.student_count}{" "}
                      {course.student_count < 2 ? "student" : "students"}
                    </div>
                  )}

                  {course.student_count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        course.student_count
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {course.student_count < 1 ? "Inactive" : "Active"}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold mt-2">
                  ₦{Number(course.price).toLocaleString()}
                </p>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-3">
                  <Button
                    onClick={() => handleViewCourse(course.id)}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    View Course
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/tutor/courses/${course.id}/enroll`)
                    }
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

      {/* LINK TO DELETED COURSES PAGE */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/tutor/courses/deleted-courses")}
        >
          View Deleted Courses
        </Button>
      </div>
    </div>
  );
}