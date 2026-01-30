"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios.config";
import { CoursePageDetails } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { CourseModulesPreview } from "./CourseModulesPreview";
import { CourseHeroSection } from "./CourseHeroSection";

export interface CourseComponentProps {
  course: CoursePageDetails & { student_count?: number };
}

export const CourseComponent = ({ course }: CourseComponentProps) => {
  const [modules, setModules] = useState<CoursePageDetails["modules"]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [msg, setMsg] = useState<string>("");

  const router = useRouter();
  const { user } = useAuth();

  const isOwner =
    user?.id !== undefined &&
    course.tutor?.id !== undefined &&
    String(user.id) === String(course.tutor.id);

  // -------------------- FETCH MODULES --------------------
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get(
          `/tutor/courses/${course.id}/modules`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [course.id]);

  // -------------------- ENROLL --------------------
  const enroll = async () => {
    try {
      await api.post(`/courses/${course.id}/enroll`);
      setMsg("Enrolled successfully");
    } catch (error: unknown) {
      let message = "Enroll failed";

      if (typeof error === "object" && error !== null) {
        const axiosError = error as {
          response?: { data?: { detail?: string } };
          message?: string;
        };

        if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        } else if (axiosError.message) {
          message = axiosError.message;
        }
      }

      setMsg(message);
    }
  };

  const handleDeleteRedirect = () => {
    router.push(`/dashboard/tutor/courses/${course.id}/delete`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      <CourseHeroSection
        course={course}
        isOwner={isOwner}
        enroll={enroll}
        msg={msg}
        handleDeleteRedirect={handleDeleteRedirect}
      />

      {isOwner && (
        <CourseModulesPreview
          courseId={course.id}
          modules={modules}
          loadingModules={loadingModules}
        />
      )}
    </div>
  );
};