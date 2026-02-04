"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TutorDashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Tutor Dashboard</h1>
        <p className="text-muted-foreground">Manage your courses and track student progress</p>
      </div>
      <Button className="bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white shadow-sm transition-all duration-300 gap-2">
        <PlusCircle className="h-4 w-4" />
        <Link href="/dashboard/tutor/courses/create" >
          Create New Course
        </Link>
      </Button>
    </div>
  );
}