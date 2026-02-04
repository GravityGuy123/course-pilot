"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";

import TutorDashboardCoursesTab from "@/components/dashboard/tutor/old/TutorDashboardCoursesTab";
import {
  mockCourses,
  mockStudents,
  mockApplications,
} from "@/components/dashboard/tutor/old/mockData";
import { TutorDashboardHeader } from "@/components/dashboard/tutor/old/TutorDashboardHeader";
import { TutorDashboardStats } from "@/components/dashboard/tutor/old/TutorDashboardStats";
import { TutorDashboardStudentsTab } from "@/components/dashboard/tutor/old/TutorDashboardStudentsTab";
import { TutorDashboardApplicationsTab } from "@/components/dashboard/tutor/old/TutorDashboardApplicationsTab";
import { TutorDashboardEarningsTab } from "@/components/dashboard/tutor/old/TutorDashboardEarningsTab";
import DashboardRoleApplication from "@/components/dashboard/shared/DashboardRoleApplication";

export default function TutorDashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("courses");

  /* ---------- AUTH GUARD ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Loading tutor dashboard…
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Fetching your user data…
        </p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="pt-6 px-4 pb-2 sm:px-6 sm:pt-6 sm:pb-2 space-y-6">
      {/* Header */}
      <TutorDashboardHeader />

      {/* Stats */}
      <TutorDashboardStats />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <TutorDashboardCoursesTab />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <TutorDashboardStudentsTab />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <TutorDashboardApplicationsTab applications={mockApplications} />
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <TutorDashboardEarningsTab />
        </TabsContent>
      </Tabs>

      <DashboardRoleApplication />
    </div>
  );
}
