"use client";

import { useEffect, useState } from "react";
import { Search, Download, BookOpen, Trash2 } from "lucide-react";
import { api } from "@/lib/axios.config";
import AdminStatusBadge from "./AdminStatusBadge";

interface AdminCourse {
  id: string;
  title: string;
  student_count: number;
  is_active: boolean;
}

export default function AdminCoursesTab() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------
  // Fetch courses
  // -------------------------
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get<AdminCourse[]>("/admin/courses");
        setCourses(res.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // -------------------------
  // Delete course
  // -------------------------
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  // -------------------------
  // Export CSV
  // -------------------------
  const exportData = () => {
    const csv = [
      ["ID", "Title", "Students", "Status"],
      ...courses.map((c) => [
        c.id,
        c.title,
        String(c.student_count),
        c.is_active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "courses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------
  // Filter
  // -------------------------
  const filteredCourses = courses.filter(
    (course) =>
      searchTerm === "" ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Courses
        </h2>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No courses found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {course.student_count} {course.student_count < 2 ? "student" : "students"} enrolled
                </p>
                <AdminStatusBadge
                  status={course.is_active ? "active" : "inactive"}
                />
              </div>

              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}