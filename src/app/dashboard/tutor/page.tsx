"use client";

import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { TutorDashboardShell } from "@/components/dashboard/tutor/TutorDashboardShell";

export default function TutorDashboardPage() {
  return (
    <ProtectedRoute>
      <TutorDashboardShell />
    </ProtectedRoute>
  );
}