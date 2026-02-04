"use client";

import { TutorCourse, TutorDashboardStats } from "@/lib/tutor-courses";
import { useMemo, useState } from "react";
import { TutorDashboardHeader } from "./TutorDashboardHeader";
import { TutorStatsCards } from "./TutorStatsCards";
import { TutorCoursesPanel } from "./TutorCoursesPanel";


function computeStats(courses: TutorCourse[]): TutorDashboardStats {
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.is_published).length;
  const draftCourses = totalCourses - publishedCourses;
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count || 0), 0);

  return { totalCourses, publishedCourses, draftCourses, totalStudents };
}

export function TutorDashboardShell() {
  const [activeCourses, setActiveCourses] = useState<TutorCourse[]>([]);
  const [deletedCourses, setDeletedCourses] = useState<TutorCourse[]>([]);

  const stats = useMemo(() => computeStats(activeCourses), [activeCourses]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <TutorDashboardHeader />
        <div className="mt-4 sm:mt-6">
          <TutorStatsCards stats={stats} />
        </div>

        <div className="mt-4 sm:mt-6 pb-10">
          <TutorCoursesPanel
            activeCourses={activeCourses}
            deletedCourses={deletedCourses}
            onActiveCoursesChange={setActiveCourses}
            onDeletedCoursesChange={setDeletedCourses}
          />
        </div>
      </div>
    </div>
  );
}