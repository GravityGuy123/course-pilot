"use client";

import React from "react";
import StudentDashboardHeader from "./StudentDashboardHeader";
import StudentStatsGrid from "./StudentStatsGrid";
import ContinueLearningCard from "./ContinueLearningCard";
import { ContinueLearning, FeaturedCourse, MyEnrollment } from "./types/student-dashboard";
import MyCoursesCard from "./MyCoursesCard";
import FeaturedCoursesCard from "./FeaturedCoursesCard";
import QuickActionsCard from "./QuickActionsCard";


export default function StudentDashboardShell({
  fullName,
  loading,
  refreshing,
  error,
  onRefresh,
  onRetry,
  totalCourses,
  activeCourses,
  completionAvg,
  lastActivityLabel,
  continueLearning,
  enrollments,
  featured,
}: {
  fullName?: string | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onRetry: () => void;

  totalCourses: number;
  activeCourses: number;
  completionAvg: number;
  lastActivityLabel: string;

  continueLearning: ContinueLearning | null;
  enrollments: MyEnrollment[];
  featured: FeaturedCourse[];
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <StudentDashboardHeader
        fullName={fullName}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <StudentStatsGrid
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        completionAvg={completionAvg}
        lastActivityLabel={lastActivityLabel}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <ContinueLearningCard
            loading={loading}
            error={error}
            onRetry={onRetry}
            continueLearning={continueLearning}
          />

          <MyCoursesCard
            loading={loading}
            error={error}
            onRetry={onRetry}
            enrollments={enrollments}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <FeaturedCoursesCard
            loading={loading}
            error={error}
            onRetry={onRetry}
            featured={featured}
          />

          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}