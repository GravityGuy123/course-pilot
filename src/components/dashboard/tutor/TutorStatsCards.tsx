"use client";

import { BookOpen, GraduationCap, Rocket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TutorDashboardStats } from "@/lib/tutor-courses";

type Props = {
  stats: TutorDashboardStats;
};

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <Card className="h-full bg-white dark:bg-gray-800">
      <CardContent className="flex h-full items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 dark:bg-indigo-500 text-white">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-semibold">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TutorStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total courses"
        value={String(stats.totalCourses)}
        hint="created by you"
        icon={<BookOpen className="h-5 w-5" />}
      />
      <StatCard
        title="Published"
        value={String(stats.publishedCourses)}
        hint="visible to students"
        icon={<Rocket className="h-5 w-5" />}
      />
      <StatCard
        title="Drafts"
        value={String(stats.draftCourses)}
        hint="not yet live"
        icon={<GraduationCap className="h-5 w-5" />}
      />
      <StatCard
        title="Total students"
        value={String(stats.totalStudents)}
        hint="enrolled across courses"
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );
}